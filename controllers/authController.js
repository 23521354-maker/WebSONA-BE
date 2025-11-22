const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Đăng ký
exports.register = async (req, res) => {
  try {
    const { HoTen, Email, SDT, DiaChi, NgaySinh, TenTaiKhoan, MatKhau } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!HoTen || !Email || !SDT || !TenTaiKhoan || !MatKhau) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      });
    }

    // Kiểm tra email đã tồn tại
    const existingEmail = await User.findOne({ where: { Email } });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng'
      });
    }

    // Kiểm tra số điện thoại đã tồn tại
    const existingPhone = await User.findOne({ where: { SDT } });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: 'Số điện thoại đã được sử dụng'
      });
    }

    // Kiểm tra tên tài khoản đã tồn tại
    const existingUsername = await User.findOne({ where: { TenTaiKhoan } });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Tên tài khoản đã được sử dụng'
      });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(MatKhau, 10);

    // Tạo ID người dùng
    const userId = 'U' + Date.now();

    // Tạo người dùng mới
    const newUser = await User.create({
      ID_U: userId,
      HoTen,
      Email,
      SDT,
      DiaChi: DiaChi || null,
      NgaySinh: NgaySinh || null,
      TenTaiKhoan,
      MatKhau: hashedPassword,
      NgayTaoTaiKhoan: new Date(),
      VaiTro: 'customer',
      TrangThai: 'active'
    });

    // Tạo token
    const token = jwt.sign(
      { 
        userId: newUser.ID_U, 
        email: newUser.Email,
        vaiTro: newUser.VaiTro 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: {
        user: {
          id: newUser.ID_U,
          hoTen: newUser.HoTen,
          email: newUser.Email,
          sdt: newUser.SDT,
          vaiTro: newUser.VaiTro
        },
        token
      }
    });

  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng ký',
      error: error.message
    });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email/số điện thoại và mật khẩu'
      });
    }

    // Tìm người dùng theo email, số điện thoại hoặc tên tài khoản
    const user = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { Email: username },
          { SDT: username },
          { TenTaiKhoan: username }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email/Số điện thoại hoặc mật khẩu không đúng'
      });
    }

    // Kiểm tra trạng thái tài khoản
    if (user.TrangThai === 'locked') {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ admin'
      });
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.MatKhau);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email/Số điện thoại hoặc mật khẩu không đúng'
      });
    }

    // Tạo token
    const token = jwt.sign(
      { 
        userId: user.ID_U, 
        email: user.Email,
        vaiTro: user.VaiTro 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        user: {
          id: user.ID_U,
          hoTen: user.HoTen,
          email: user.Email,
          sdt: user.SDT,
          diaChi: user.DiaChi,
          ngaySinh: user.NgaySinh,
          tenTaiKhoan: user.TenTaiKhoan,
          vaiTro: user.VaiTro
        },
        token
      }
    });

  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng nhập',
      error: error.message
    });
  }
};

// Lấy thông tin người dùng hiện tại
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['MatKhau'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.ID_U,
          hoTen: user.HoTen,
          email: user.Email,
          sdt: user.SDT,
          diaChi: user.DiaChi,
          ngaySinh: user.NgaySinh,
          tenTaiKhoan: user.TenTaiKhoan,
          vaiTro: user.VaiTro,
          trangThai: user.TrangThai
        }
      }
    });

  } catch (error) {
    console.error('Lỗi lấy thông tin user:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};
