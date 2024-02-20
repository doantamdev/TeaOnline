const mongoose = require('mongoose')

const User = new mongoose.Schema({
    email: {type: String,default:''},
    password: {type: String,default:''},
    isAdmin:{type:Boolean,default:false},
    timestamp: {type: Date,default: Date.now},
    nonce:{type: String,default:null},
    pwdResetTime:{type: Date,default:null},
})

module.exports = mongoose.model('User',User)