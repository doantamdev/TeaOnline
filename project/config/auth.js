const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const bcrypt = require('bcryptjs')

module.exports = function(passport){
    passport.serializeUser(function(user, next){
        next(null, user.id);
    });

    passport.deserializeUser(function(id, next){
        User.findById(id)
            .then(user => {
                next(null, user);
            })
            .catch(err => {
                next(err, null);
            });
    });
    

    const localLogin = new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, function(req, email, password, next){
        User.findOne({ email: email })
            .then(user => {
                if (!user) {
                    return next(new Error('Người dùng không tồn tại' ));
                }
                if (bcrypt.compareSync(password, user.password) == false) {
                    return next(new Error('Sai mật khẩu'));
                }

                return next(null, user);
            })
            .catch(err => next(err));
    });

    const localRegister = new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true,
    }, async function(req, email, password, next) {
        try {
            const existingUser = await User.findOne({ email: email });
            if (existingUser) {
                return next(new Error('Người dùng đã tồn tại' ));
            }
            const hashPassword = bcrypt.hashSync(password,10)
            let isAdmin = false
            if(email.indexOf('admin') != 1)
            {
                isAdmin = true
            }
            const newUser = await User.create({email: email, password: hashPassword,isAdmin:isAdmin});
            return next(null, newUser);
        } catch (err) {
            return next(err);
        }
    });
    
    
    


    passport.use('localRegister', localRegister);
    passport.use('localLogin', localLogin);
};
