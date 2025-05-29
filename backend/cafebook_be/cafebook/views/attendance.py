from rest_framework.decorators import api_view
from rest_framework.response import Response
from cafebook.models import Attendance, NhanVien
from math import radians, sin, cos, sqrt, atan2
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from ..permissions import IsAuthenticatedWithJWT
from rest_framework.response import Response
from django.utils import timezone
from ..models import Attendance, NhanVien
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
import traceback

OFFICE_LAT = 10.762622  # Thay đổi theo tọa độ văn phòng thực tế
OFFICE_LNG = 106.660172
MAX_DISTANCE = 100  # Khoảng cách tối đa cho phép (mét)

def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371000  # Bán kính trái đất (mét)
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    return R * c

@api_view(['POST'])
def check_attendance(request):
    employee_id = request.data.get('employee_id')
    latitude = float(request.data.get('latitude'))
    longitude = float(request.data.get('longitude'))

    try:
        nhan_vien = NhanVien.objects.get(IDNhanVien=employee_id)
        print(f"Checking attendance for employee: {nhan_vien.TenNV} (ID: {nhan_vien.IDNhanVien}) at location ({latitude}, {longitude})")
        distance = calculate_distance(latitude, longitude, OFFICE_LAT, OFFICE_LNG)
        attendance_status = 'SUCCESS' if distance <= MAX_DISTANCE else 'FAILED'

        attendance = Attendance.objects.create(
            nhan_vien=nhan_vien,
            latitude=latitude,
            longitude=longitude,
            status=attendance_status
        )

        return Response({
            'status': attendance_status,
            'message': 'Chấm công thành công' if attendance_status == 'SUCCESS' else 'Bạn ở quá xa văn phòng',
            'distance': round(distance, 2)
        })

    except NhanVien.DoesNotExist:
        return Response(
            {'error': 'Không tìm thấy nhân viên'}, 
            status=attendance_status.HTTP_404_NOT_FOUND
        )
@csrf_exempt
@api_view(['GET'])
@permission_classes([IsAuthenticatedWithJWT])
def get_attendance_status(request):
    print("Checking if user is authenticated...", request)
    try:
        print("Fetching attendance status for user:", request.user)
        # Get the NhanVien instance associated with the authenticated user
        # nhan_vien = NhanVien.objects.get(user=request.user)
        
        today = timezone.now().date()
        attendance = Attendance.objects.filter(
            nhan_vien__CCCDNV=request.user['CCCDNV'],
            check_in_time__date=today
        ).first()

        return Response({
            'success': True,
            'is_checked_in': attendance is not None,
            'checkInTime': attendance.check_in_time.strftime('%H:%M:%S') if attendance else None,
            'checkOutTime': attendance.check_out_time.strftime('%H:%M:%S') if attendance and attendance.check_out_time else None,
            'message': 'Lấy trạng thái thành công'
        })
    except NhanVien.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Không tìm thấy thông tin nhân viên'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print("Error fetching attendance status:", traceback.format_exc())
        return Response({
            'success': False,
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)