# 🔧 SONA Backend API

RESTful API server for the SONA e-commerce system, built with Node.js, Express, and MySQL.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Database Models](#database-models)
- [Middleware](#middleware)
- [Error Handling](#error-handling)

---

## 🎯 Overview

The SONA Backend API provides a complete RESTful interface for managing:
- User authentication and authorization
- Product catalog
- Shopping cart operations
- Order management
- User profiles

**Key Features:**
- JWT-based authentication
- Sequelize ORM for database operations
- Bcrypt password hashing
- CORS enabled
- Environment-based configuration
- Request logging
- Error handling middleware

---

## 🚀 Tech Stack

- **Runtime**: Node.js v18+
- **Framework**: Express v5.1.0
- **Database**: MySQL v8.0+
- **ORM**: Sequelize v6.37.7
- **Authentication**: JWT v9.0.2
- **Password Hashing**: Bcryptjs v3.0.3
- **Environment Config**: dotenv v17.2.3
- **Database Driver**: MySQL2 v3.15.3
- **CORS**: cors v2.8.5

---

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # Database connection configuration
├── controllers/
│   ├── authController.js    # Authentication logic (register, login)
│   ├── orderController.js   # Order CRUD operations
│   └── productController.js # Product operations
├── middlewares/
│   └── auth.js              # JWT authentication middleware
├── models/
│   ├── User.js              # User model (Sequelize)
│   └── Order.js             # Order model (Sequelize)
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   ├── orderRoutes.js       # Order endpoints
│   └── productRoutes.js     # Product endpoints
├── utils/                   # Utility functions
├── .env                     # Environment variables (create this)
├── app.js                   # Application entry point
└── package.json             # Dependencies
```

---

## 🔧 Installation

### Prerequisites
- Node.js v18 or higher
- MySQL v8.0 or higher
- npm or yarn

### Steps

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   # Create .env file (see Configuration section below)
   ```

4. **Import database**
   ```bash
   mysql -u root -p < ../Sona.sql
   ```

5. **Start the server**
   ```bash
   node app.js
   ```

   Server will start at `http://localhost:3000`

---

## ⚙️ Configuration

Create a `.env` file in the `backend/` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=sona
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_secret_key_here_make_it_long_and_random
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration (optional)
ALLOWED_ORIGINS=http://localhost:8080
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | MySQL host | localhost |
| `DB_USER` | MySQL username | root |
| `DB_PASSWORD` | MySQL password | - |
| `DB_NAME` | Database name | sona |
| `DB_PORT` | MySQL port | 3306 |
| `JWT_SECRET` | Secret key for JWT | - |
| `JWT_EXPIRES_IN` | Token expiration | 24h |
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |

---

## 📚 API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register New User
```http
POST /api/auth/register
Content-Type: application/json

Request Body:
{
  "username": "string",      // Required, unique
  "email": "string",         // Required, unique, valid email
  "password": "string",      // Required, min 6 characters
  "HoTen": "string",        // Required
  "SDT": "string"           // Required
}

Response (201):
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "ID_U": "U1234567890",
    "TenDN": "username",
    "Email": "user@example.com",
    "HoTen": "Full Name",
    "VaiTro": "user"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

Request Body:
{
  "username": "string",      // Required
  "password": "string"       // Required
}

Response (200):
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "ID_U": "U1234567890",
    "TenDN": "username",
    "Email": "user@example.com",
    "HoTen": "Full Name"
  }
}
```

---

### Order Endpoints

All order endpoints require authentication. Include JWT token in the Authorization header:
```
Authorization: Bearer {your_jwt_token}
```

#### Create Order
```http
POST /api/orders
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "HoTen": "string",         // Recipient name
  "SDT": "string",           // Phone number
  "DiaChi": "string",        // Delivery address
  "items": [
    {
      "ID_SP": "string",     // Product ID
      "SoLuong": number,     // Quantity
      "DonGia": number,      // Unit price
      "ThanhTien": number    // Total price
    }
  ],
  "TongTien": number         // Order total
}

Response (201):
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "ID_DH": "DH001",
    "ID_U": "U1234567890",
    "HoTen": "Recipient Name",
    "SDT": "0987654321",
    "DiaChi": "123 Street, City",
    "TongTien": 5000000,
    "TrangThai": "cho_xac_nhan",
    "NgayDat": "2024-12-06 10:30:00"
  }
}
```

#### Get User Orders
```http
GET /api/orders
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "orders": [
    {
      "ID_DH": "DH001",
      "HoTen": "Recipient Name",
      "TongTien": 5000000,
      "TrangThai": "cho_xac_nhan",
      "NgayDat": "2024-12-06 10:30:00"
    }
  ]
}
```

#### Get Order Details
```http
GET /api/orders/:orderId
Authorization: Bearer {token}

Example: GET /api/orders/DH001

Response (200):
{
  "success": true,
  "order": {
    "ID_DH": "DH001",
    "ID_U": "U1234567890",
    "HoTen": "Recipient Name",
    "SDT": "0987654321",
    "DiaChi": "123 Street, City",
    "TongTien": 5000000,
    "TrangThai": "cho_xac_nhan",
    "NgayDat": "2024-12-06 10:30:00",
    "items": [
      {
        "ID_SP": "CPU_001",
        "TenSP": "Intel Core i7",
        "SoLuong": 1,
        "DonGia": 5000000,
        "ThanhTien": 5000000,
        "HinhAnhChinh": "/img/cpu-001.png"
      }
    ]
  }
}
```

#### Delete Order
```http
DELETE /api/orders/:orderId
Authorization: Bearer {token}

Example: DELETE /api/orders/DH001

Response (200):
{
  "success": true,
  "message": "Order deleted successfully"
}

Note: Only orders with status "cho_xac_nhan" can be deleted
```

---

### Product Endpoints

#### Get All Products
```http
GET /api/products

Query Parameters (optional):
- category: Filter by category (cpu, vga, ram, etc.)
- search: Search in product name
- limit: Number of results (default: all)

Response (200):
{
  "success": true,
  "products": [
    {
      "ID_SP": "CPU_001",
      "TenSP": "Intel Core i7",
      "MoTa": "Description...",
      "GiaBan": 5000000,
      "SoLuongTon": 50,
      "HinhAnhChinh": "/img/cpu-001.png",
      "DanhMuc": "cpu",
      "TrangThai": "active"
    }
  ]
}
```

#### Get Product Details
```http
GET /api/products/:productId

Example: GET /api/products/CPU_001

Response (200):
{
  "success": true,
  "product": {
    "ID_SP": "CPU_001",
    "TenSP": "Intel Core i7",
    "MoTa": "Detailed description...",
    "GiaBan": 5000000,
    "SoLuongTon": 50,
    "HinhAnhChinh": "/img/cpu-001.png",
    "DanhMuc": "cpu",
    "TrangThai": "active"
  }
}
```

---

## 🔐 Authentication

### JWT Authentication Flow

1. **User Registration/Login**
   - User provides credentials
   - Server validates and creates JWT token
   - Token contains user ID and role
   - Token expires in 24 hours (configurable)

2. **Making Authenticated Requests**
   ```javascript
   // Include token in Authorization header
   headers: {
     'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
   }
   ```

3. **Token Verification**
   - Middleware extracts token from header
   - Verifies token signature and expiration
   - Attaches user info to request object
   - Proceeds to route handler

### Password Security
- Passwords hashed with bcrypt (10 salt rounds)
- Plain passwords never stored in database
- Hashing happens before database insert

---

## 🗄️ Database Models

### User Model (nguoidung)

```javascript
{
  ID_U: String (PK),          // U + timestamp
  TenDN: String (unique),     // Username
  MatKhau: String,            // Bcrypt hash
  Email: String (unique),     // Email address
  HoTen: String,              // Full name
  SDT: String,                // Phone number
  VaiTro: String,             // Role: 'user' or 'admin'
  NgayTao: DateTime           // Created timestamp
}
```

### Order Model (donhang)

```javascript
{
  ID_DH: String (PK),         // DH + sequential number
  ID_U: String (FK),          // User ID
  HoTen: String,              // Recipient name
  SDT: String,                // Phone number
  DiaChi: String,             // Delivery address
  TongTien: Integer,          // Total amount
  TrangThai: String,          // Order status
  NgayDat: DateTime           // Order date
}
```

**Order Status Values:**
- `cho_xac_nhan` - Pending confirmation
- `dang_xu_ly` - Processing
- `dang_giao` - Shipping
- `hoan_thanh` - Completed
- `da_huy` - Cancelled

### Order Details Model (chitietdonhang)

```javascript
{
  ID_CTDH: Integer (PK),      // Auto increment
  ID_DH: String (FK),         // Order ID
  ID_SP: String (FK),         // Product ID
  SoLuong: Integer,           // Quantity
  DonGia: Integer,            // Unit price
  ThanhTien: Integer          // Total price
}
```

### Product Model (sanpham)

```javascript
{
  ID_SP: String (PK),         // Product ID
  TenSP: String,              // Product name
  MoTa: Text,                 // Description
  GiaBan: Integer,            // Price
  SoLuongTon: Integer,        // Stock quantity
  HinhAnhChinh: String,       // Main image path
  DanhMuc: String,            // Category
  TrangThai: String           // Status: 'active' or 'inactive'
}
```

---

## 🛡️ Middleware

### Authentication Middleware (`auth.js`)

```javascript
// Protects routes that require authentication
// Usage in routes:
router.get('/protected', authMiddleware, controller.method);

// What it does:
// 1. Extracts token from Authorization header
// 2. Verifies token validity
// 3. Decodes user information
// 4. Attaches user to req.user
// 5. Calls next() or returns 401
```

### CORS Middleware

```javascript
// Enables cross-origin requests from frontend
// Configured in app.js
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS || '*',
  credentials: true
}));
```

### Body Parser Middleware

```javascript
// Parses incoming JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

---

## ⚠️ Error Handling

### Error Response Format

```javascript
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Internal server error |

### Common Error Scenarios

**Authentication Errors:**
```javascript
// Missing token
{ "success": false, "message": "No token provided" }

// Invalid token
{ "success": false, "message": "Invalid token" }

// Expired token
{ "success": false, "message": "Token expired" }
```

**Validation Errors:**
```javascript
// Missing required fields
{ "success": false, "message": "Missing required fields" }

// Invalid email format
{ "success": false, "message": "Invalid email format" }

// Password too short
{ "success": false, "message": "Password must be at least 6 characters" }
```

**Database Errors:**
```javascript
// Duplicate entry
{ "success": false, "message": "Username already exists" }

// Foreign key violation
{ "success": false, "message": "Referenced record not found" }

// Connection error
{ "success": false, "message": "Database connection failed" }
```

---

## 🧪 Testing

### Manual Testing with API Tester

The project includes an interactive API testing tool:
```
http://localhost:8080/html-css/api-tester.html
```

Features:
- Test all endpoints
- Automatic token management
- View formatted responses
- Pre-filled test data

### Using cURL

**Register User:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "HoTen": "Test User",
    "SDT": "0987654321"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

**Get Orders (with token):**
```bash
curl -X GET http://localhost:3000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔧 Development

### Running in Development Mode

```bash
# With auto-restart (install nodemon first)
npm install -g nodemon
nodemon app.js

# With debugging
node --inspect app.js
```

### Database Migrations

```bash
# Reset database
mysql -u root -p sona < ../Sona.sql

# Backup database
mysqldump -u root -p sona > backup.sql
```

### Logging

Server logs requests and errors to console:
```javascript
// Request logging
[2024-12-06 10:30:00] POST /api/orders - 201 - 45ms

// Error logging
[2024-12-06 10:31:00] ERROR: Database connection failed
```

---

## 📝 Best Practices

1. **Security:**
   - Never commit `.env` file
   - Use strong JWT secret
   - Validate all inputs
   - Sanitize database queries

2. **Code Organization:**
   - Keep controllers thin
   - Use services for business logic
   - Centralize error handling
   - Follow RESTful conventions

3. **Database:**
   - Use transactions for complex operations
   - Index frequently queried fields
   - Avoid N+1 query problems
   - Use connection pooling

4. **API Design:**
   - Use proper HTTP methods
   - Return consistent response format
   - Include pagination for large datasets
   - Version your API if needed

---

## 🐛 Troubleshooting

### Server won't start

**Problem:** Port 3000 already in use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

**Problem:** Database connection failed
- Check MySQL is running
- Verify `.env` credentials
- Ensure database exists
- Check firewall settings

### Authentication issues

**Problem:** Token always invalid
- Check JWT_SECRET matches
- Verify token format (Bearer token)
- Check token expiration
- Ensure clock synchronization

### Database errors

**Problem:** Table doesn't exist
```bash
mysql -u root -p sona < ../Sona.sql
```

**Problem:** Foreign key constraint fails
- Ensure referenced records exist
- Check data types match
- Verify relationship definitions

---

## 📞 Support

For issues or questions:
- **GitHub Issues**: [WebSONA-FE Issues](https://github.com/23521354-maker/WebSONA-FE/issues)
- **Documentation**: [API Docs](http://localhost:8080/html-css/api-docs.html)

---

**Built with ❤️ using Node.js and Express**
