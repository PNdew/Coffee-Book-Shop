from pyngrok import ngrok, conf
import os
import json
import requests
from urllib.parse import urlparse

NGROK_AUTH_TOKEN = "2v4ruFYhdDu1HOXuA6zOp9EsMk9_648bjpWfkAYeDiBXrGxf9"
ngrok_process = None  # Biến toàn cục để quản lý tiến trình

def start_ngrok():
    global ngrok_process
    
    # Đảm bảo chỉ có 1 kết nối
    if ngrok_process is not None:
        ngrok.kill()
    
    # Cấu hình ngrok
    conf.get_default().auth_token = NGROK_AUTH_TOKEN
    conf.get_default().region = "ap"  # Chọn region gần (ap = Asia Pacific)
    
    try:
        # Kết nối với cổng 8000
        public_url = ngrok.connect(8000, bind_tls=True).public_url
        print(f" * Ngrok URL: {public_url}")
        update_app_json(public_url)
        return public_url
    except Exception as e:
        print(f"Lỗi khi khởi động ngrok: {str(e)}")
        return None

def update_app_json(public_url):
    app_json_path = os.path.join(os.path.dirname(__file__), 'app.json')
    
    # Đọc file app.json nếu tồn tại
    if os.path.exists(app_json_path):
        with open(app_json_path, 'r') as f:
            data = json.load(f)
    else:
        data = {}
    
    # Cập nhật URL API
    base_url = f"{public_url}/api/"  # Điều chỉnh theo cấu trúc API của bạn
    data['API_URL_MOBILE'] = base_url
    
    # Lưu lại file app.json
    with open(app_json_path, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f" * Đã cập nhật API URL MOBILE trong app.json: {base_url}")

def stop_ngrok():
    ngrok.kill()