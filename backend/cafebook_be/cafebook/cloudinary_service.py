import cloudinary.uploader

def upload_image_to_cloudinary(file, folder="sanpham"):
    """
    Upload ảnh lên Cloudinary và trả về URL.
    """
    result = cloudinary.uploader.upload(file, folder=folder)
    return result.get("secure_url")
