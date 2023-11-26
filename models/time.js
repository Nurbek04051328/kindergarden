const {Schema, model} = require('mongoose')

const  time = new Schema({
    userId: String,
    title: {
        type: String,
        required: [true, "Nomini kiriting"],
    },
    order: {
        type:Number,
        default: 0
    },
    createdTime: Date,
    updateTime: Date,
    status: {
        type: Number,
        default: 1
    }
})


module.exports = model('Time', time)