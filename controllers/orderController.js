const Order = require('../models/Order');

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
  getUserOrders,
  getOrderDetail
};
