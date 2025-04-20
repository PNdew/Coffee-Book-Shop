import jwt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

class JWTHandler:
    def __init__(self):
        self.secret = os.getenv('JWT_SECRET')
        self.algorithm = os.getenv('JWT_ALGORITHM', 'HS256')

    def generate_access_token(self, nhan_vien):
        """Tạo access token với thông tin nhân viên"""
        payload = {
            'SDTNV': nhan_vien['SDTNV'],
            'TenNV': nhan_vien['TenNV'], 
            'ChucVuNV': nhan_vien['IDChucVu'],
            'exp': datetime.utcnow() + timedelta(minutes=60),
            'type': 'access'
        }
        return jwt.encode(payload, self.secret, algorithm=self.algorithm)

    def generate_refresh_token(self, SDTNV):
        """Tạo refresh token"""
        payload = {
            'SDTNV': SDTNV,
            'exp': datetime.utcnow() + timedelta(days=7),
            'type': 'refresh'
        }
        return jwt.encode(payload, self.secret, algorithm=self.algorithm)

    def verify_token(self, token):
        """Xác thực token"""
        try:
            return jwt.decode(token, self.secret, algorithms=[self.algorithm])
        except jwt.ExpiredSignatureError:
            raise Exception('Token đã hết hạn')
        except jwt.InvalidTokenError:
            raise Exception('Token không hợp lệ')