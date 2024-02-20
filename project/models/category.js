const mongoose = require('mongoose')

const Category = new mongoose.Schema({
    name: {type: String,default:''},
    desc: {type: String,default:''},
    timestamp: {type: Date,default: Date.now}
})

module.exports = mongoose.model('Category',Category)