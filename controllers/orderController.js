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

    // Tạo mã đơn hàng theo thứ tự (DH001, DH002, DH003, ...)
    const lastOrder = await sequelize.query(
      `SELECT ID_DH FROM donhang ORDER BY ID_DH DESC LIMIT 1`,
      { type: sequelize.QueryTypes.SELECT, transaction }
    );
    
    let nextOrderNumber = 1;
    if (lastOrder.length > 0) {
      const lastId = lastOrder[0].ID_DH;
      const numberPart = parseInt(lastId.replace('DH', ''));
      nextOrderNumber = numberPart + 1;
    }
    const orderCode = 'DH' + String(nextOrderNumber).padStart(3, '0');

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
      const itemId = 'CTDH' + Date.now() + Math.random().toString(36).substr(2, 9);
      await sequelize.query(`
        INSERT INTO chitietdonhang (ID_CTDH, ID_DH, ID_SP, SoLuong, DonGia, ThanhTien)
        VALUES (?, ?, ?, ?, ?, ?)
      `, {
        replacements: [itemId, orderCode, item.id, item.qty, item.price, item.price * item.qty],
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
    const formattedOrders = await Promise.all(orders.map(async (order) => {
      const orderData = order.toJSON();
      
      // Lấy số lượng mục trong đơn hàng
      let itemCount = 0;
      try {
        const items = await sequelize.query(
          'SELECT COUNT(*) as count FROM chitietdonhang WHERE ID_DH = ?',
          { replacements: [orderData.ID_DH], type: sequelize.QueryTypes.SELECT }
        );
        itemCount = items[0]?.count || 0;
      } catch (e) {
        itemCount = 1;
      }
      
      // Định dạng ngày
      let formattedDate = '';
      if (orderData.NgayDat) {
        const date = new Date(orderData.NgayDat);
        const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
                           'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
        formattedDate = `${date.getDate()} ${monthNames[date.getMonth()]}, ${date.getFullYear()}`;
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
          statusText = orderData.TrangThaiDonHang || 'Không xác định';
          statusClass = 'status-default';
      }

      return {
        id: orderData.ID_DH,
        date: formattedDate,
        status: statusText,
        statusClass: statusClass,
        total: Number(orderData.TongTienThanhToan || 0),
        itemCount: itemCount,
        customerName: orderData.HoTenNhan,
        customerPhone: orderData.SDTNhan,
        customerAddress: orderData.DiaChiGiaoHang,
        note: orderData.GhiChu,
        paymentMethod: orderData.PhuongThucThanhToan
      };
    }));

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

    console.log(`[getOrderDetail] Fetching order ${orderId} for user ${userId}`);

    // Get order info
    const orderQuery = `
      SELECT * FROM donhang 
      WHERE ID_DH = ? AND ID_U = ?
    `;
    
    const orderResults = await sequelize.query(orderQuery, {
      replacements: [orderId, userId],
      type: sequelize.QueryTypes.SELECT
    });

    if (!orderResults || orderResults.length === 0) {
      console.log(`[getOrderDetail] Order not found`);
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    const order = orderResults[0];
    console.log(`[getOrderDetail] Order found:`, order.ID_DH);

    // Get items
    const itemsQuery = `
      SELECT 
        ctdh.ID_CTDH,
        ctdh.ID_SP,
        ctdh.SoLuong,
        ctdh.DonGia,
        ctdh.ThanhTien,
        sp.TenSP,
        sp.HinhAnhChinh,
        sp.GiaBan
      FROM chitietdonhang ctdh
      LEFT JOIN sanpham sp ON ctdh.ID_SP = sp.ID_SP
      WHERE ctdh.ID_DH = ?
      ORDER BY ctdh.ID_CTDH
    `;

    const items = await sequelize.query(itemsQuery, {
      replacements: [orderId],
      type: sequelize.QueryTypes.SELECT
    });

    console.log(`[getOrderDetail] Items found: ${items.length}`);

    // Map items to response format
    const formattedItems = items.map(item => ({
      ID_SP: item.ID_SP,
      TenSP: item.TenSP || 'Sản phẩm',
      HinhAnhChinh: item.HinhAnhChinh || '/img/legion.png',
      SoLuong: item.SoLuong,
      DonGia: item.DonGia,
      ThanhTien: item.ThanhTien
    }));

    // Build response
    const response = {
      success: true,
      order: {
        ...order,
        items: formattedItems
      }
    };

    console.log(`[getOrderDetail] Response prepared, items count: ${formattedItems.length}`);
    console.log(`[getOrderDetail] Response keys:`, Object.keys(response.order));

    res.json(response);

  } catch (error) {
    console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy chi tiết đơn hàng: ' + error.message
    });
  }
};

// Xoá đơn hàng (chỉ cho đơn hàng chờ xác nhận)
const deleteOrder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const userId = req.user.ID_U;
    const { orderId } = req.params;

    // Kiểm tra đơn hàng tồn tại và thuộc về user
    const order = await Order.findOne({
      where: { ID_DH: orderId, ID_U: userId }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Đơn hàng không tồn tại'
      });
    }

    // Chỉ cho phép xoá đơn hàng ở trạng thái "chờ xác nhận"
    if (order.TrangThaiDonHang !== 'cho_xac_nhan') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể xoá đơn hàng ở trạng thái "Chờ xác nhận"'
      });
    }

    // Tắt foreign key check tạm thời
    await sequelize.query('SET FOREIGN_KEY_CHECKS=0', { transaction });

    // Xoá chi tiết đơn hàng trước
    await sequelize.query(
      'DELETE FROM chitietdonhang WHERE ID_DH = ?',
      { replacements: [orderId], transaction }
    );

    // Xoá đơn hàng
    await Order.destroy({
      where: { ID_DH: orderId },
      transaction
    });

    // Bật lại foreign key check
    await sequelize.query('SET FOREIGN_KEY_CHECKS=1', { transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Đã xoá đơn hàng thành công'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Lỗi khi xoá đơn hàng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xoá đơn hàng: ' + error.message
    });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderDetail,
  deleteOrder
};
