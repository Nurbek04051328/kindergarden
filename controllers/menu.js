const bcrypt = require('bcrypt');
const Time = require("../models/time");
const Product = require("../models/product");
const Food = require("../models/food");
const Menu = require("../models/menu");
const decoded = require("../service/decoded");
const kirilLotin = require("../service/kirilLotin");
const mongoose = require("mongoose")


const all = async (req, res) => {
    let userFunction = decoded(req,res)
    let quantity = req.query.quantity || 20;
    let next = req.query.next || 1;
    next = (next-1)*quantity;
    let product = req.query.product || null;
    let menus = [];
    let fil = {};
    let othername = kirilLotin.kirlot(title)
    if (product) fil = {...fil, product};
    menus = await Menu.find({...fil, userId:userFunction.id })
        .populate(['food', 'product', 'time' ])
        .sort({_id:-1})
        .limit(quantity)
        .skip(next).lean();
    const count = await Menu.find({...fil, userId:userFunction.id }).count();

    res.status(200).json({ menus, count });
}


const allActive = async (req, res) => {
    let userFunction = decoded(req,res)
    let menus = await Menu.find({ userId:userFunction.id, status:1 }).populate(['food', 'product', 'time' ]).lean()
    res.status(200).json(menus);
}

const changeStatus = async (req, res) => {
    if (req.params.id) {
        const _id = req.params.id
        let status = req.query.status;
        let menu = await Menu.findOne({_id}).lean()
        if(req.query.status) {
            menu.status = parseInt(status)
        } else {
            menu.status = menu.status == 0 ? 1 : 0
        }
        let upstatus = await Menu.findByIdAndUpdate(_id,menu)
        let saveMenu = await Menu.findOne({_id:_id}).populate(['food', 'product', 'time' ]).lean()
        res.status(200).send(saveMenu)
    } else {
        res.ststus(400).send({message: "Id topilmadi"})
    }
}

const create = async (req, res) => {
    try {
        let { food, product, time, data } = req.body;
        let userFunction = decoded(req,res)
        console.log("userFunction", userFunction)
        const menu = await new Menu({ userId:userFunction.id, food, product, time, data, createdTime:Date.now() });
        await menu.validate();
        await menu.save();
        let newTime = await Menu.findOne({_id:menu._id}).populate(['food', 'product', 'time' ]).lean()
        return res.status(201).json(newTime);
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            const errors = {};
            for (let key in error.errors) {
                errors[key] = error.errors[key].message;
            }
            res.status(400).send(errors);
        } else {
            res.status(500).send(error);
        }
    }
}


const update = async (req, res) => {
    if (req.body._id) {
        let { _id, food, product, time, data } = req.body;
        let menu = await Menu.findOneAndUpdate({_id:_id},{ food, product, time, data, updateTime:Date.now()}, {returnDocument: 'after'});
        let saveMenu = await Menu.findOne({_id:time._id}).populate(['food', 'product', 'time' ]).lean();
        res.status(200).json(saveMenu);
    } else {
        res.status(400).json({message: "Id topilmadi"});
    }

}

const findOne = async (req, res) => {
    if (req.params.id) {
        const _id = req.params.id;
        let menu = await Menu.findOne({_id: _id}).populate(['food', 'product', 'time' ]).lean();
        res.status(200).json(menu);
    } else {
        res.status(400).json({message: "Id topilmadi"});
    }
}

const del = async(req,res)=>{
    if (req.params.id) {
        let _id = req.params.id;
        let menu = await Menu.findByIdAndDelete(_id);
        res.status(200).json({message:'Удалено!', data: menu._id});
    } else {
        res.status(400).json({message: "Id topilmadi"});
    }
}


module.exports = { all, allActive, changeStatus, create, update, findOne, del }