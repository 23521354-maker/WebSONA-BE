// Express app entry point
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./config/database');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/authRoutes');

// Routes
app.use('/api/auth', authRoutes);

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
    app.listen(PORT, () => {
      console.log(`✓ Server đang chạy tại http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('✗ Lỗi kết nối database:', err);
  });

module.exports = app;