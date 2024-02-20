const express = require('express')
const mongoose = require('mongoose')
const passport = require('passport')
const session = require('express-session')

const path = require('path')

const auth = require('./config/auth')(passport)
const home = require('./routes/home')
const register = require('./routes/register')
const login = require('./routes/login')
const profile = require('./routes/profile')
const admin = require('./routes/admin')

mongoose.connect("mongodb://127.0.0.1:27017/mystore")
    .then(function (data) {
        console.log('DB connected');
    })
    .catch(function (err) {
        console.log('Can not connected to DB' + err.message);
    });

const app = express();
app.use(session({
    secret: 'ehgksjdhhkdfhauqnrvfhjsklfnj',
    resave:true,
    saveUninitialized:true,
}))

app.use(passport.initialize())
app.use(passport.session())

app.set('views', path.join(__dirname,'views'))
app.set('view engine','hjs')

app.use(express.json())
app.use(express.urlencoded({extended:false})) //xử lý form đưa thành json chuyển qua register
app.use(express.static(path.join(__dirname,'public')))

app.use('/',home)
app.use('/register',register)
app.use('/login',login)
app.use('/profile',profile)
app.use('/admin',admin)

app.use(function(err,req,res,next){
    console.log(err)
    res.render('error',{message: err.message})
})

app.listen(8080)
console.log('App running')