const {Schema, model} = require('mongoose')

const food = new Schema({
    userId: String,
    title: {
        type: String,
        required: [true, "Nomini kiriting"],
    },
    products: [
        {
            id: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: [true, "Mahsulotni kiriting"],
            },
            netto: Number
        }
    ],
    price: {
        type: Number,
        required: [true, "Narxini kiriting"],
    },
    createdTime: Date,
    updateTime: Date,
    status: {
        type: Number,
        default: 1
    }
})


module.exports = model('Food', food)