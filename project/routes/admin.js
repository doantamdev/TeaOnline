const express = require('express');
const router = express.Router();
const multer = require('multer');
const category = require('../models/category');
const producttoadd = require('../models/product');

// Cấu hình lưu trữ
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Đảm bảo rằng trường được gửi từ biểu mẫu HTML có tên là 'myFiles'
        if (file.fieldname === 'myFiles') {
            cb(null, 'public/images'); // Thư mục lưu trữ tệp tải lên
        } else {
            cb(new Error('Invalid fieldname'));
        }
    },
    filename: (req, file, cb) => {
        // Lấy phần mở rộng của tệp gốc
        const ext = file.originalname.split('.').pop();
        // Tạo tên tệp mới bao gồm thời gian và phần mở rộng
        cb(null, new Date().toISOString().replace(/:/g, '-') + '.' + ext);
    }
});

// Khởi tạo đối tượng upload multer với cấu hình lưu trữ
const upload = multer({ storage: storage });


router.get('/', async function (req, res, next) {
    try {
        const user = req.user;
        if (user == null || !user.isAdmin) {
            res.redirect('/');
            return;
        }

        const categories = await category.find().exec();
        const products = await producttoadd.find().exec();

        const data = {
            user: user,
            categories: categories,
            products: products,
        };

        res.render('admin', data);
    } catch (err) {
        next(err);
    }
});


router.post('/addcategory', function(req, res, next) {
    const user = req.user;
    if (user == null || !user.isAdmin) {
        res.redirect('/');
        return;
    }

    category.create(req.body)
        .then(Category => {
           res.redirect('/admin')
        })
        .catch(err => {
            return next(err);
        });
});

router.post('/addproduct', upload.array('myFiles', 5), function (req, res, next) {
    // Lấy danh sách các tệp đã được tải lên từ trường 'images'
    const imageFiles = req.files;
    const imageUrls = [];

    // Lặp qua từng tệp và lấy đường dẫn, sau đó thêm vào mảng imageUrls
    imageFiles.forEach(file => {
        imageUrls.push(file.path);
    });

    // Tiếp tục xử lý logic thêm sản phẩm vào cơ sở dữ liệu
    const newProductData = {
        name: req.body.namesp,
        desc: req.body.descsp,
        images: imageUrls, // Sử dụng mảng đường dẫn của tất cả các tệp ảnh
        category: req.body.category,
        cateid: req.body.cateid,
        price: req.body.price,
        quantity: req.body.quantity
    };

    producttoadd.create(newProductData)
        .then(Product => {
            res.redirect('/admin');
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error saving product to database');
        });
});

  
module.exports = router