const bcrypt = require('bcrypt');
const Product = require("../models/product");
const Food = require("../models/food");
const decoded = require("../service/decoded");
const kirilLotin = require("../service/kirilLotin");
const mongoose = require("mongoose")


const all = async (req, res) => {
    let userFunction = decoded(req,res)
    let quantity = req.query.quantity || 20;
    let next = req.query.next || 1;
    next = (next-1)*quantity;
    let title = req.query.title || null;
    let foods = [];
    let fil = {};
    let othername = kirilLotin.kirlot(title)
    if (title) {
        fil = {
            ...fil, $or: [
                {'title': {$regex: new RegExp(title.toLowerCase(), 'i')}},
                {'title': {$regex: new RegExp(othername.toLowerCase(), 'i')}},
            ]
        }
    }
    foods = await Food.find({...fil, userId:userFunction.id })
        .populate(['products.id'])
        .sort({_id:-1})
        .limit(quantity)
        .skip(next).lean();
    const count = await Food.find({...fil, userId:userFunction.id }).count();

    res.status(200).json({ foods, count });
}


const allActive = async (req, res) => {
    let userFunction = decoded(req,res)
    let foods = await Food.find({ userId:userFunction.id, status:1 }).lean()
    res.status(200).json(foods);
}

const changeStatus = async (req, res) => {
    if (req.params.id) {
        const _id = req.params.id
        let status = req.query.status;
        let food = await Food.findOne({_id}).lean()
        if(req.query.status) {
            food.status = parseInt(status)
        } else {
            food.status = food.status == 0 ? 1 : 0
        }
        let upstatus = await Food.findByIdAndUpdate(_id,food)
        let saveFood = await Food.findOne({_id:_id}).lean()
        res.status(200).send(saveFood)
    } else {
        res.ststus(400).send({message: "Id topilmadi"})
    }
}

const create = async (req, res) => {
    try {
        let { title, products, price } = req.body;
        let userFunction = decoded(req,res)
        const food = await new Food({ userId:userFunction.id, title, products, price, createdTime:Date.now() });
        await food.validate();
        await food.save();
        let newFood = await Food.findOne({_id:food._id}).lean()
        return res.status(201).json(newFood);
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
        let { _id, title, products, price } = req.body;
        let food = await Food.findOneAndUpdate({_id:_id},{ title, products, price, updateTime:Date.now()}, {returnDocument: 'after'});
        let saveFood = await Food.findOne({_id:food._id}).lean();
        res.status(200).json(saveFood);
    } else {
        res.status(400).json({message: "Id topilmadi"});
    }

}

const findOne = async (req, res) => {
    if (req.params.id) {
        const _id = req.params.id;
        let food = await Food.findOne({_id: _id}).lean();
        res.status(200).json(food);
    } else {
        res.status(400).json({message: "Id topilmadi"});
    }
}

const get_food = async (req, res) => {
    if (req.params.id) {
        // console.log('ku')
        const _id = req.params.id;
        let food = await Food.findOne({_id: _id}).populate(['products.id']).lean();
        res.status(200).json(food);
    } else {
        res.status(400).json({message: "Id topilmadi"});
    }
}

const del = async(req,res)=>{
    if (req.params.id) {
        let _id = req.params.id;
        let food = await Food.findByIdAndDelete(_id);
        res.status(200).json({message:'Удалено!', data: food._id});
    } else {
        res.status(400).json({message: "Id topilmadi"});
    }
}


module.exports = { all, allActive, changeStatus, create, update, findOne, del, get_food }