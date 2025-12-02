const Order = require('../models/Order');
const sequelize = require('../config/database');

// Tạo đơn hàng mới
const createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const userId = req.user.ID_U;
    const { items, customerInfo, paymentMethod, note } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Giỏ hàng trống'
      });
    }

    // Tính tổng tiền
    let tongTien = 0;
    for (const item of items) {
      tongTien += item.price * item.qty;
    }

    // Tạo mã đơn hàng
    const orderCode = 'DH' + Date.now();

    // Tạo đơn hàng
    const order = await Order.create({
      ID_DH: orderCode,
      ID_U: userId,
      NgayDat: new Date(),
      TrangThaiDonHang: 'cho_xac_nhan',
      TongTienHang: tongTien,
      PhiVanChuyen: 0,
      TongTienThanhToan: tongTien,
      PhuongThucThanhToan: paymentMethod || 'bank_transfer',
      HoTenNhan: customerInfo?.name || '',
      SDTNhan: customerInfo?.phone || '',
      DiaChiGiaoHang: customerInfo?.address || '',
      GhiChu: note || ''
    }, { transaction });

    // Lưu chi tiết đơn hàng
    for (const item of items) {
      await sequelize.query(`
        INSERT INTO chitietdonhang (ID_DH, ID_SP, SoLuong, DonGia, ThanhTien)
        VALUES (?, ?, ?, ?, ?)
      `, {
        replacements: [orderCode, item.id, item.qty, item.price, item.price * item.qty],
        transaction
      });
    }

    await transaction.commit();

    res.json({
      success: true,
      message: 'Đặt hàng thành công',
      orderId: orderCode
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Lỗi khi tạo đơn hàng:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      sql: error.sql
    });
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo đơn hàng: ' + error.message
    });
  }
};

// Lấy danh sách đơn hàng của người dùng
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.ID_U;
    
    const orders = await Order.findAll({
      where: { ID_U: userId },
      order: [['NgayDat', 'DESC']]
    });

    // Định dạng lại dữ liệu
    const formattedOrders = orders.map(order => {
      const orderData = order.toJSON();
      
      // Định dạng ngày
      let formattedDate = '';
      if (orderData.NgayDat) {
        const date = new Date(orderData.NgayDat);
        const months = ['Một', 'Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy', 'Tám', 'Chín', 'Mười', 'Mười Một', 'Chín'];
        formattedDate = `Tháng ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
      }

      // Định dạng trạng thái
      let statusText = '';
      let statusClass = '';
      switch(orderData.TrangThaiDonHang) {
        case 'hoan_thanh':
          statusText = 'Đã hoàn thành';
          statusClass = 'status-completed';
          break;
        case 'da_huy':
          statusText = 'Đã hủy';
          statusClass = 'status-cancelled';
          break;
        case 'cho_xac_nhan':
          statusText = 'Chờ xác nhận';
          statusClass = 'status-pending';
          break;
        case 'len_don':
          statusText = 'Lên đơn';
          statusClass = 'status-processing';
          break;
        case 'dang_giao':
          statusText = 'Đang giao';
          statusClass = 'status-shipping';
          break;
        default:
          statusText = orderData.TrangThaiDonHang;
          statusClass = 'status-default';
      }

      return {
        id: orderData.ID_DH,
        date: formattedDate,
        status: statusText,
        statusClass: statusClass,
        total: orderData.TongTienThanhToan || 0,
        itemCount: 1 // Có thể tính từ chi tiết đơn hàng
      };
    });

    res.json({
      success: true,
      orders: formattedOrders
    });
  } catch (error) {
    console.error('Lỗi khi lấy đơn hàng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy đơn hàng'
    });
  }
};

// Lấy chi tiết đơn hàng
const getOrderDetail = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.ID_U;

    const order = await Order.findOne({
      where: { 
        ID_DH: orderId,
        ID_U: userId 
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    res.json({
      success: true,
      order: order
    });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy chi tiết đơn hàng'
    });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderDetail
};
