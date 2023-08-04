const {Schema, model} = require("mongoose");

const User = new Schema({
    login: {
        type: String, 
        required: [true, "Loginni kiriting"],
        unique: true
    },
    password: {
        type: String, 
        required: [true, "Parolni kiriting"]
    },
    role:{
        type:String,
        required: [true, "User rolini kiriting"]
    },
    name:String,
    phone:String,
    avatar: String,
    loginAt: [Date],
    createdAt: Date,
    updateAt:Date,
    status: {
        type: Number,
        default: 1
    }
})

module.exports = model("User", User)