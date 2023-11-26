const bcrypt = require('bcrypt');
const decoded = require("../service/decoded");
const kirilLotin = require("../service/kirilLotin");
const mongoose = require("mongoose");
const Product = require("../models/product");
const PriceProduct = require("../models/priceproduct");
const Time = require("../models/time");
const Food = require("../models/food");
const Menu = require("../models/menu");

const all = async (req, res) => {
    let userFunction = decoded(req,res)
    const productCount = await Product.find({ userId:userFunction.id }).count();
    const priceProductCount = await PriceProduct.find({ userId:userFunction.id }).count();
    const timeCount = await Time.find({ userId:userFunction.id }).count();
    const foodCount = await Food.find({ userId:userFunction.id }).count();
    const menuCount = await Menu.find({ userId:userFunction.id }).count();

    let counts = {
        productCount:productCount,
        priceProductCount:priceProductCount,
        timeCount:timeCount,
        foodCount:foodCount,
        menuCount:menuCount
    };

    const productPrice = await PriceProduct.find({ userId:userFunction.id }).populate(['product']).sort({_id:-1}).limit(10).lean();

    // Menu Today
    const today = new Date();
    today.setHours(0,0,0,0);
    const menuToday = await Menu.find({ userId:userFunction.id, data: { $gte: today }}).populate(['food', 'product', 'time', 'food.product' ]).lean();

    // Menu Weekly
    const today1 = new Date();
    const oneWeekAgo = new Date(today1.getFullYear(), today1.getMonth(), today1.getDate() - 7);
    const menuWeekly = await Menu.find({ data: { $gte: oneWeekAgo, $lt: today1 } }).populate(['food', 'product', 'time', 'food.product' ]).lean();

    res.status(200).json({ counts, productPrice, menuToday, menuWeekly });
}




module.exports = { all }