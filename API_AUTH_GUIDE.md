# API Đăng Nhập & Đăng Ký - SONA

## Base URL
```
http://localhost:3000/api
```

## Endpoints

### 1. Đăng ký tài khoản
**POST** `/auth/register`

**Request Body:**
```json
{
  "HoTen": "Nguyễn Văn A",
  "Email": "nguyenvana@gmail.com",
  "SDT": "0912345678",
  "DiaChi": "123 Đường ABC, Quận 1, TP.HCM",
  "NgaySinh": "1990-01-01",
  "TenTaiKhoan": "nguyenvana",
  "MatKhau": "password123"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "user": {
      "id": "U1732189234567",
      "hoTen": "Nguyễn Văn A",
      "email": "nguyenvana@gmail.com",
      "sdt": "0912345678",
      "vaiTro": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Email đã được sử dụng"
}
```

---

### 2. Đăng nhập
**POST** `/auth/login`

**Request Body:**
```json
{
  "username": "nguyenvana@gmail.com",  // có thể dùng email, sđt hoặc tên tài khoản
  "password": "password123"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "user": {
      "id": "U1732189234567",
      "hoTen": "Nguyễn Văn A",
      "email": "nguyenvana@gmail.com",
      "sdt": "0912345678",
      "diaChi": "123 Đường ABC, Quận 1, TP.HCM",
      "ngaySinh": "1990-01-01T00:00:00.000Z",
      "tenTaiKhoan": "nguyenvana",
      "vaiTro": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Response Error (401):**
```json
{
  "success": false,
  "message": "Email/Số điện thoại hoặc mật khẩu không đúng"
}
```

---

### 3. Lấy thông tin user hiện tại
**GET** `/auth/me`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "U1732189234567",
      "hoTen": "Nguyễn Văn A",
      "email": "nguyenvana@gmail.com",
      "sdt": "0912345678",
      "diaChi": "123 Đường ABC, Quận 1, TP.HCM",
      "ngaySinh": "1990-01-01T00:00:00.000Z",
      "tenTaiKhoan": "nguyenvana",
      "vaiTro": "customer",
      "trangThai": "active"
    }
  }
}
```

---

## Test với cURL

### Đăng ký:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "HoTen": "Nguyễn Văn A",
    "Email": "nguyenvana@gmail.com",
    "SDT": "0912345678",
    "DiaChi": "123 Đường ABC",
    "NgaySinh": "1990-01-01",
    "TenTaiKhoan": "nguyenvana",
    "MatKhau": "password123"
  }'
```

### Đăng nhập:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "nguyenvana@gmail.com",
    "password": "password123"
  }'
```

### Lấy thông tin user (cần token):
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Test với Postman

1. **Đăng ký:**
   - Method: POST
   - URL: `http://localhost:3000/api/auth/register`
   - Body > raw > JSON
   - Paste JSON từ ví dụ trên

2. **Đăng nhập:**
   - Method: POST
   - URL: `http://localhost:3000/api/auth/login`
   - Body > raw > JSON
   - Copy token từ response

3. **Get user info:**
   - Method: GET
   - URL: `http://localhost:3000/api/auth/me`
   - Headers > Authorization: `Bearer YOUR_TOKEN`

---

## Ghi chú

- Token có thời hạn 7 ngày
- Mật khẩu được mã hóa bằng bcrypt
- Frontend tự động lưu token vào localStorage
- API hỗ trợ CORS cho phép gọi từ frontend
