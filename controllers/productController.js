const sequelize = require('../config/database');

// Lấy tất cả sản phẩm
exports.getAllProducts = async (req, res) => {
    try {
        const [products] = await sequelize.query(`
            SELECT sp.*, dm.TenDM, h.TenHang 
            FROM sanpham sp
            LEFT JOIN danhmuc dm ON sp.ID_DM = dm.ID_DM
            LEFT JOIN hangsanxuat h ON sp.ID_HANG = h.ID_HANG
            WHERE sp.TrangThai = 'con_hang'
            ORDER BY sp.NgayTao DESC
        `);
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách sản phẩm' });
    }
};

// Lấy sản phẩm flashsale (sản phẩm mới nhất, giới hạn 5)
exports.getFlashsaleProducts = async (req, res) => {
    try {
        const [products] = await sequelize.query(`
            SELECT sp.*, dm.TenDM, h.TenHang 
            FROM sanpham sp
            LEFT JOIN danhmuc dm ON sp.ID_DM = dm.ID_DM
            LEFT JOIN hangsanxuat h ON sp.ID_HANG = h.ID_HANG
            WHERE sp.TrangThai = 'con_hang'
            ORDER BY sp.NgayTao DESC
            LIMIT 5
        `);
        res.json(products);
    } catch (error) {
        console.error('Error fetching flashsale products:', error);
        res.status(500).json({ message: 'Lỗi khi lấy sản phẩm flashsale' });
    }
};

// Lấy sản phẩm bán chạy (sắp xếp theo lượt mua)
exports.getBestSellers = async (req, res) => {
    try {
        const [products] = await sequelize.query(`
            SELECT sp.*, dm.TenDM, h.TenHang 
            FROM sanpham sp
            LEFT JOIN danhmuc dm ON sp.ID_DM = dm.ID_DM
            LEFT JOIN hangsanxuat h ON sp.ID_HANG = h.ID_HANG
            WHERE sp.TrangThai = 'con_hang'
            ORDER BY sp.LuotMua DESC, sp.LuotXem DESC
            LIMIT 4
        `);
        res.json(products);
    } catch (error) {
        console.error('Error fetching best sellers:', error);
        res.status(500).json({ message: 'Lỗi khi lấy sản phẩm bán chạy' });
    }
};

// Lấy phụ kiện (từ danh mục phụ kiện)
exports.getAccessories = async (req, res) => {
    try {
        const [products] = await sequelize.query(`
            SELECT sp.*, dm.TenDM, h.TenHang 
            FROM sanpham sp
            LEFT JOIN danhmuc dm ON sp.ID_DM = dm.ID_DM
            LEFT JOIN hangsanxuat h ON sp.ID_HANG = h.ID_HANG
            WHERE sp.TrangThai = 'con_hang' 
            AND dm.TenDM LIKE '%phụ kiện%'
            ORDER BY sp.NgayTao DESC
            LIMIT 4
        `);
        res.json(products);
    } catch (error) {
        console.error('Error fetching accessories:', error);
        res.status(500).json({ message: 'Lỗi khi lấy phụ kiện' });
    }
};

// Lấy chi tiết sản phẩm
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const [products] = await sequelize.query(`
            SELECT sp.*, dm.TenDM, h.TenHang 
            FROM sanpham sp
            LEFT JOIN danhmuc dm ON sp.ID_DM = dm.ID_DM
            LEFT JOIN hangsanxuat h ON sp.ID_HANG = h.ID_HANG
            WHERE sp.ID_SP = ?
        `, { replacements: [id] });

        if (products.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }

        // Lấy hình ảnh bổ sung
        const [images] = await sequelize.query(`
            SELECT * FROM sanpham_hinhanh 
            WHERE ID_SP = ? 
            ORDER BY ThuTu
        `, { replacements: [id] });

        // Tăng lượt xem
        await sequelize.query('UPDATE sanpham SET LuotXem = LuotXem + 1 WHERE ID_SP = ?', 
            { replacements: [id] });

        res.json({
            ...products[0],
            images
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Lỗi khi lấy chi tiết sản phẩm' });
    }
};

// Tìm kiếm sản phẩm
exports.searchProducts = async (req, res) => {
    try {
        const { q } = req.query;
        const [products] = await sequelize.query(`
            SELECT sp.*, dm.TenDM, h.TenHang 
            FROM sanpham sp
            LEFT JOIN danhmuc dm ON sp.ID_DM = dm.ID_DM
            LEFT JOIN hangsanxuat h ON sp.ID_HANG = h.ID_HANG
            WHERE sp.TrangThai = 'con_hang'
            AND (sp.TenSP LIKE ? OR sp.MoTaNgan LIKE ? OR dm.TenDM LIKE ? OR h.TenHang LIKE ?)
            ORDER BY sp.LuotXem DESC
            LIMIT 20
        `, { replacements: [`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`] });
        res.json(products);
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({ message: 'Lỗi khi tìm kiếm sản phẩm' });
    }
};

// Lấy sản phẩm theo danh mục
exports.getProductsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const [products] = await sequelize.query(`
            SELECT sp.*, dm.TenDM, h.TenHang 
            FROM sanpham sp
            LEFT JOIN danhmuc dm ON sp.ID_DM = dm.ID_DM
            LEFT JOIN hangsanxuat h ON sp.ID_HANG = h.ID_HANG
            WHERE sp.TrangThai = 'con_hang' AND sp.ID_DM = ?
            ORDER BY sp.NgayTao DESC
        `, { replacements: [categoryId] });
        res.json(products);
    } catch (error) {
        console.error('Error fetching products by category:', error);
        res.status(500).json({ message: 'Lỗi khi lấy sản phẩm theo danh mục' });
    }
};
