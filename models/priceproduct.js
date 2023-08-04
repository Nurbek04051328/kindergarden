const {Schema, model} = require('mongoose')

const priceProduct = new Schema({
    userId: String,
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, "Mahsulotni kiriting"],
    },
    price: {
        type: Number,
        required: [true, "Narxini kiriting"],
    },
    data: {
        type: Date,
    },
    createdTime: Date,
    updateTime: Date,
    status: {
        type: Number,
        default: 1
    }
})


module.exports = model('PriceProduct',priceProduct)