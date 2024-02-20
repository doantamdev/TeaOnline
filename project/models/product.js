const mongoose = require('mongoose')

const Product = new mongoose.Schema({
    name: {type: String,default:''},
    desc: {type: String,default:''},
    images: {type: [String],default:''},
    category: {type: String,default:''},
    cateid: {type: String,default:0},
    price: {type: Number,default:0},
    quantity: {type: Number,default:0},
    interested: {type: Array,default:[]},
    timestamp: {type: Date,default: Date.now}
})

module.exports = mongoose.model('Product',Product)