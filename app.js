// Express app entry point
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./config/database');

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',').map(o => o.trim()).filter(o => o);
    
    // In development, allow localhost
    if (process.env.NODE_ENV !== 'production') {
      allowedOrigins.push('http://localhost:3000');
      allowedOrigins.push('http://localhost:3001');
      allowedOrigins.push('http://localhost:5173');
      allowedOrigins.push('http://127.0.0.1:3000');
    }
    
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');

// Routes
console.log('Đang đăng ký routes...');
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
console.log('Routes đã đăng ký: /api/auth, /api/orders, /api/products');

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'SONA API Server đang chạy' });
});

// Kết nối database và khởi động server
const PORT = process.env.PORT || 3000;

sequelize.authenticate()
  .then(() => {
    console.log('✓ Kết nối database thành công');
    return sequelize.sync({ alter: false }); // Không tự động thay đổi schema
  })
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✓ Server đang chạy tại http://0.0.0.0:${PORT}`);
      console.log(`✓ Truy cập công khai: http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('✗ Lỗi kết nối database:', err);
  });

module.exports = app;