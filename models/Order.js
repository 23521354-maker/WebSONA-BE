const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('donhang', {
  ID_DH: {
    type: DataTypes.STRING(50),
    primaryKey: true,
    field: 'ID_DH'
  },
  ID_U: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'ID_U'
  },
  NgayDat: {
    type: DataTypes.DATE,
    field: 'NgayDat'
  },
  NgayCapNhat: {
    type: DataTypes.DATE,
    field: 'NgayCapNhat'
  },
  TrangThaiDonHang: {
    type: DataTypes.STRING(30),
    field: 'TrangThaiDonHang'
  },
  PhuongThucThanhToan: {
    type: DataTypes.STRING(30),
    defaultValue: 'COD',
    field: 'PhuongThucThanhToan'
  },
  HoTenNhan: {
    type: DataTypes.STRING(100),
    field: 'HoTenNhan'
  },
  SDTNhan: {
    type: DataTypes.STRING(15),
    field: 'SDTNhan'
  },
  DiaChiGiaoHang: {
    type: DataTypes.STRING(200),
    field: 'DiaChiGiaoHang'
  },
  TongTienHang: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'TongTienHang'
  },
  PhiVanChuyen: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'PhiVanChuyen'
  },
  TongTienThanhToan: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'TongTienThanhToan'
  },
  GhiChu: {
    type: DataTypes.STRING(500),
    field: 'GhiChu'
  }
}, {
  tableName: 'donhang',
  timestamps: false
});

module.exports = Order;
