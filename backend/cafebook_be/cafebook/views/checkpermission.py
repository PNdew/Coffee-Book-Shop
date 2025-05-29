from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from cafebook.utils import check_permission

@csrf_exempt
def check_permission_api(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Phương thức không hợp lệ'}, status=405)

    try:
        data = json.loads(request.body)
        chuc_vu = data.get('chuc_vu')
        chuc_nang = data.get('chuc_nang')  # mã quyền
        print(chuc_vu, chuc_nang)

        if not chuc_vu or not chuc_nang:
            print("Thiếu thông tin")
            return JsonResponse({'error': 'Thiếu thông tin'}, status=400)

        access = check_permission(chuc_vu, chuc_nang)
        print(access)
        return JsonResponse({'access': access})

    except Exception as e:
        print(e)
        return JsonResponse({'error': str(e)}, status=500)
