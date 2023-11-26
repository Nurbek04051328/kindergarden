const bcrypt = require('bcrypt');
const PriceProduct = require("../models/priceproduct");
const Product = require("../models/product");
const decoded = require("../service/decoded");
const kirilLotin = require("../service/kirilLotin");
const mongoose = require("mongoose");
const fs = require('fs');
const ExcelJs = require('exceljs');
const path = require("path");
const reader = require('xlsx');


const all = async (req, res) => {
    let userFunction = decoded(req,res)
    let quantity = req.query.quantity || 20;
    let next = req.query.next || 1;
    next = (next-1)*quantity;
    let product = req.query.product || null;
    let price = req.query.price || null;
    let data = req.query.data || null;
    let from = req.query.from || null
    let to = req.query.to || null
    let priceProducts = [];
    let fil = {};

    if (product) fil = {...fil, product};
    if (price) fil = {...fil, price};
    if (data) fil = {...fil, data: data};
    if (from) fil = {...fil, data: { $gte: from }}
    if (to) fil = {...fil, data: { $lte: to }}
    priceProducts = await PriceProduct.find({...fil, userId:userFunction.id })
        .populate(['product'])
        .sort({data:-1})
        .limit(quantity)
        .skip(next).lean();
    const count = await PriceProduct.find({...fil, userId:userFunction.id }).count();

    res.status(200).json({ priceProducts, count });
}


const allActive = async (req, res) => {
    let userFunction = decoded(req,res)
    let priceProducts = await PriceProduct.find({ userId:userFunction.id, status:1 }).populate(['product']).lean()
    res.status(200).json(priceProducts);
}

const changeStatus = async (req, res) => {
    if (req.params.id) {
        const _id = req.params.id
        let status = req.query.status;
        let priceProduct = await PriceProduct.findOne({_id}).lean()
        if(req.query.status) {
            priceProduct.status = parseInt(status)
        } else {
            priceProduct.status = priceProduct.status == 0 ? 1 : 0
        }
        let upstatus = await PriceProduct.findByIdAndUpdate(_id,priceProduct)
        let savePriceProduct = await PriceProduct.findOne({_id:_id}).populate(['product']).lean()
        res.status(200).send(savePriceProduct)
    } else {
        res.ststus(400).send({message: "Id topilmadi"})
    }
}

const create = async (req, res) => {
    try {
        let { product, price, data } = req.body;
        if (!data) {
            data = Date.now()
        }
        let userFunction = decoded(req,res)
        const priceProduct = await new PriceProduct({ userId:userFunction.id, product, price, data, createdTime:Date.now() });
        await priceProduct.validate();
        await priceProduct.save();
        let newPriceProduct = await PriceProduct.findOne({_id:priceProduct._id}).populate(['product']).lean()
        return res.status(201).json(newPriceProduct);
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
        let { _id, product, price, data } = req.body;
        let priceProduct = await PriceProduct.findOneAndUpdate({_id:_id},{ product, price, data, updateTime:Date.now()}, {returnDocument: 'after'});
        let savePriceProduct = await PriceProduct.findOne({_id:priceProduct._id}).populate(['product']).lean();
        res.status(200).json(savePriceProduct);
    } else {
        res.status(400).json({message: "Id topilmadi"});
    }

}

const findOne = async (req, res) => {
    if (req.params.id) {
        const _id = req.params.id;
        let priceProduct = await PriceProduct.findOne({_id: _id}).populate(['product']).lean();
        res.status(200).json(priceProduct);
    } else {
        res.status(400).json({message: "Id topilmadi"});
    }
}

const del = async(req,res)=>{
    if (req.params.id) {
        let _id = req.params.id;
        let priceProduct = await PriceProduct.findByIdAndDelete(_id);
        res.status(200).json({message:'Удалено!', data: priceProduct._id});
    } else {
        res.status(400).json({message: "Id topilmadi"});
    }
}

// EXCELL

const excell = async (req, res, next) => {
    try {
        let userFunction = decoded(req,res)
        let product = req.query.product || null
        let price = req.query.price || null
        let from = req.query.from || null
        let to = req.query.to || null
        let priceProducts = []
        let fil = {}
        if (product) fil = {...fil,product}
        if (parseInt(price) >=0) fil = {...fil,price}
        if (from) fil = {...fil, createdTime: { $gte: from }}
        if (to) fil = {...fil, createdTime: { $lte: to }}



        priceProducts = await PriceProduct.find( {userId:userFunction.id, ...fil}).populate([ 'product' ]).sort({data:-1}).lean()

        // let count = await Book.find().select(['_id']).count()
        const workbook = new ExcelJs.Workbook()
        const worksheet = workbook.addWorksheet('Document');

        worksheet.columns = [
            {header: 'N', key: 'id', width: 10},
            {header: 'Mahsulot nomi', key: 'product', width: 70},
            {header: 'Birligi', key: 'productunit', width: 70},
            {header: 'Narxi', key: 'price', width: 70},
            {header: 'Sanasi', key: 'data', width: 70},
        ];
        if (priceProducts.length>0) {
            priceProducts.forEach((priceproduct, index) => {
                worksheet.addRow({
                    id: index + 1,
                    product: priceproduct.product.title,
                    productunit: priceproduct.product.unit,
                    price: priceproduct.price,
                    data: priceproduct.data,

                })
            })
        }
        worksheet.getRow(1).eachCell((cell) => {
            cell.font = {bold: true};
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });
        let rows = worksheet.getRows(2, priceProducts.length)
        rows.forEach(el=>{
            el.eachCell((cell)=> {
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
            });
        })
        let filename = path.join(__dirname, '../files/excel', 'priceproduct.xlsx')
        await workbook.xlsx.writeFile(filename)
        res.status(200).send("files/excel/priceproduct.xlsx")
    } catch (e) {
        console.log(e)
        res.status(500).send({message: "Serverda xatolik"})
    }
}


module.exports = { all, allActive, changeStatus, create, update, findOne, excell, del }