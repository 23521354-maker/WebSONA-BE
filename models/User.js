const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  ID_U: {
    type: DataTypes.STRING(50),
    primaryKey: true,
    allowNull: false
  },
  HoTen: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  Email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true
  },
  SDT: {
    type: DataTypes.STRING(15),
    allowNull: true,
    unique: true
  },
  DiaChi: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  NgaySinh: {
    type: DataTypes.DATE,
    allowNull: true
  },
  NgayTaoTaiKhoan: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW
  },
  TenTaiKhoan: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true
  },
  MatKhau: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  VaiTro: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: 'customer'
  },
  TrangThai: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: 'active'
  }
}, {
  tableName: 'users',
  timestamps: false
});

module.exports = User;
