const bcrypt = require('bcrypt');
const Product = require("../models/product");
const decoded = require("../service/decoded");
const kirilLotin = require("../service/kirilLotin");
const mongoose = require("mongoose")


const all = async (req, res) => {
    let userFunction = decoded(req,res)
    let quantity = req.query.quantity || 20;
    let next = req.query.next || 1;
    next = (next-1)*quantity;
    let title = req.query.title || null;
    let products = [];
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
    products = await Product.find({...fil, userId:userFunction.id })
        .sort({_id:-1})
        .limit(quantity)
        .skip(next).lean();
    const count = await Product.find({...fil, userId:userFunction.id }).count();

    res.status(200).json({ products, count });
}


const allActive = async (req, res) => {
    let userFunction = decoded(req,res)
    let title = req.query.title || null;
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
    let product = await Product.find({...fil, userId:userFunction.id, status:1 }).lean()
    res.status(200).json(product);
}

const changeStatus = async (req, res) => {
    if (req.params.id) {
        const _id = req.params.id
        let status = req.query.status;
        let product = await Product.findOne({_id}).lean()
        if(req.query.status) {
            product.status = parseInt(status)
        } else {
            product.status = product.status == 0 ? 1 : 0
        }
        let upstatus = await Product.findByIdAndUpdate(_id,product)
        let saveProduct = await Product.findOne({_id:_id}).lean()
        res.status(200).send(saveProduct)
    } else {
        res.ststus(400).send({message: "Id topilmadi"})
    }
}

const create = async (req, res) => {
    try {
        let { title, unit, img } = req.body;
        let userFunction = decoded(req,res)
        console.log("userFunction", userFunction)
        const product = await new Product({ userId:userFunction.id, title, unit, img, createdTime:Date.now() });
        await product.validate();
        await product.save();
        let newProduct = await Product.findOne({_id:product._id}).lean()
        return res.status(201).json(newProduct);
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
        let { _id, title, unit, img } = req.body;
        let product = await Product.findOneAndUpdate({_id:_id},{ title, unit, img, updateTime:Date.now()}, {returnDocument: 'after'});
        let saveProduct = await Product.findOne({_id:product._id}).lean();
        res.status(200).json(saveProduct);
    } else {
        res.status(400).json({message: "Id topilmadi"});
    }

}

const findOne = async (req, res) => {
    if (req.params.id) {
        const _id = req.params.id;
        let product = await Product.findOne({_id: _id}).lean();
        if (product) {
            res.status(200).json(product);
        } else {
            res.status(400).json({message: "Id topilmadi"});
        }
    } else {
        res.status(400).json({message: "Id topilmadi"});
    }
}

const del = async(req,res)=>{
    if (req.params.id) {
        let _id = req.params.id;
        let findProduct = await Product.findOne({_id: _id}).lean();
        if (findProduct) {
            let product = await Product.findByIdAndDelete(_id);
            res.status(200).json({message:'Удалено!', data: product._id});
        } else {
            res.status(400).json({message: "Id topilmadi"});
        }

    } else {
        res.status(400).json({message: "Id topilmadi"});
    }
}


module.exports = { all, allActive, changeStatus, create, update, findOne, del }