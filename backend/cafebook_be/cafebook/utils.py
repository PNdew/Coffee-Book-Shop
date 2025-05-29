from .models import ChucVu_Quyen, NhomQuyen_Quyen, Quyen

def check_permission(idchucvu: int, code: str) -> bool:
    print(f"🔍 Kiểm tra quyền cho chức vụ: {idchucvu}, mã quyền: {code}")
    
    # Lấy danh sách nhóm quyền thuộc về chức vụ này
    nhom_quyen_ids = ChucVu_Quyen.objects.filter(
        idchucvu=idchucvu
    ).values_list('idnhomquyen', flat=True)

    print(f"➡️ Số nhóm quyền thuộc chức vụ: {len(nhom_quyen_ids)}")

    # Tìm quyền ứng với code đó thuộc 1 trong các nhóm quyền trên
    quyen_ton_tai = NhomQuyen_Quyen.objects.filter(
        idnhomquyen__in=nhom_quyen_ids,
        idquyen__kyhieu=code
    ).exists()

    print(f"✅ Quyền tồn tại: {quyen_ton_tai}")
    return quyen_ton_tai
