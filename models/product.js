const {Schema, model} = require('mongoose')

const product = new Schema({
    userId: String,
    title: {
        type: String,
        required: [true, "Nomini kiriting"],
    },
    unit: {
        type: String,
        required: [true, "Birligini kiriting"],
    },
    img: [],
    createdTime: Date,
    updateTime: Date,
    status: {
        type: Number,
        default: 1
    }
})


module.exports = model('Product',product)