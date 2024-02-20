const express = require('express')
const router = express.Router()
const sgMail = require('@sendgrid/mail')
const Product = require('../models/product')
const User = require('../models/user')
const bcrypt = require('bcryptjs')

sgMail.setApiKey('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')

function randomString(length) {
    let text = ''
    const ky_tu = "AĂÂBCDĐEÊGHIKLMNOÔƠPQRSTUƯVXY0123456789"
    for (let i = 0; i < length; i++) {
        text += ky_tu.charAt(Math.floor(Math.random() * ky_tu.length))
    }
    return text
}

router.get('/', async function (req, res, next) {
    const user = req.user;
    if (!user) {
        res.redirect('/');
        return;
    }

    try {
        const productsPromise = Product.find().exec();
        const interestedPromise = Product.find({ interested: user._id }).exec();

        const [products, interested] = await Promise.all([productsPromise, interestedPromise]);

        const data = {
            user: user,
            products: products,
            interested: interested
        };
        res.render('profile', data);
    } catch (err) {
        // Xử lý lỗi nếu có
        return next(err);
    }
});




router.get('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/')
    });
});


router.get('/addlikeproduct/:productID', async function (req, res, next) {
    const user = req.user;
    if (!user) {
        res.redirect('/');
        return;
    }

    try {
        const product = await Product.findById(req.params.productID);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (product.interested.indexOf(user._id) === -1) {
            product.interested.push(user._id);
            await product.save();
            return res.redirect('/profile')
        } else {
            return res.json({ message: "User already likes this product" });
        }
    } catch (err) {
        // Xử lý lỗi nếu có
        return next(err);
    }
});

router.get('/unlikeproduct/:productID', async function (req, res, next) {
    const user = req.user;
    if (!user) {
        res.redirect('/');
        return;
    }

    try {
        const product = await Product.findById(req.params.productID);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const userIndex = product.interested.indexOf(user._id);
        if (userIndex !== -1) {
            product.interested.splice(userIndex, 1); // Xóa người dùng khỏi mảng interested
            await product.save();
            return res.redirect('/profile');
        } else {
            return res.json({ message: "User hasn't liked this product" });
        }
    } catch (err) {
        // Xử lý lỗi nếu có
        return next(err);
    }
});
router.post('/resetpassword', async function (req, res, next) {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.nonce = randomString(12) //token
        user.pwdResetTime = new Date()
        user.save()

        const msg = {
            to: req.body.email, // Change to your recipient
            from: 'doantampn2017@gmail.com', // Change to your verified sender
            subject: 'Reset password',
            text: 'Test',
            html: '<h1>Hãy click vào <a style="color:red" href="http://localhost:8080/profile/reset-password?nonce=' + user.nonce + '&id=' + user._id + '">đường link </a>để reset mật khẩu</h1>',
        }

        sgMail
            .send(msg)
            .then(() => {
                console.log('Email sent')
                return next(new Error("Hãy kiểm tra Email để reset password"))
            })
            .catch((error) => {
                console.error(error)
            })

    } catch (err) {
        // Xử lý lỗi nếu có
        return next(err);
    }
});

router.get('/reset-password', async function (req, res, next) {
    const nonce = req.query.nonce;
    if (nonce == null) {
        return next(new Error("Lỗi khi reset password"));
    }

    const user_id = req.query.id;
    if (user_id == null) {
        return next(new Error("Lỗi khi reset password"));
    }

    try {
        const user = await User.findById(user_id);

        if (!user) {
            return next(new Error("Lỗi khi reset password"));
        }

        if (user.pwdResetTime == null) {
            return next(new Error("Lỗi khi reset password"))
        }
        if (user.nonce == null) {
            return next(new Error("Lỗi khi reset password"))
        }
        if (nonce != user.nonce) {
            return next(new Error("Lỗi khi reset password"))
        }

        const now = new Date();
        const difference = now - user.pwdResetTime; // milliseconds
        const diff_seconds = difference / 1000;

        if (diff_seconds > 24 * 60 * 60) {
            return next(new Error("Lỗi khi reset password"));
        }
        const data = {
            id: user_id,
            nonce: nonce
        }
        res.render('resetpw', data)
    } catch (error) {
        return next(new Error("Lỗi khi reset password"));
    }
});

router.post('/newpwd', async function (req, res, next) {
    try {
        const { password1, password2, nonce, id: user_id } = req.body;

        if (password1 == null || password2 == null || nonce == null || user_id == null) {
            throw new Error("Lỗi khi reset password");
        }

        if (password1 !== password2) {
            throw new Error("Password và nhập lại phải giống nhau");
        }

        const user = await User.findById(user_id);

        if (!user || user.pwdResetTime == null || user.nonce == null || nonce != user.nonce) {
            throw new Error("Lỗi khi reset password");
        }

        const now = new Date();
        const difference = now - user.pwdResetTime; // milliseconds
        const diff_seconds = difference / 1000;

        if (diff_seconds > 24 * 60 * 60) {
            throw new Error("Lỗi khi reset password");
        }

        const hashPassword = bcrypt.hashSync(password1, 10);
        user.password = hashPassword;
        user.pwdResetTime = null;
        user.nonce = null;
        await user.save();

        res.json({ message: "Password đã thay đổi" });
    } catch (error) {
        return next(error);
    }
});


module.exports = router