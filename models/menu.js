const {Schema, model} = require('mongoose')

const menu = new Schema({
    userId: String,
    food: {
        type: Schema.Types.ObjectId,
        ref: 'Food',
        default: null
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        default: null,
    },
    time: {
        type: Schema.Types.ObjectId,
        ref: 'Time',
        default: null,
        required: [true, "Ovqat paytini kiriting"],
    },
    data: {
        type: Date,
        required: [true, "Vaqtni kiriting"],
    },
    createdTime: Date,
    updateTime: Date,
    status: {
        type: Number,
        default: 1
    }
})


module.exports = model('Menu', menu)