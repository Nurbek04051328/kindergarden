const bcrypt = require('bcrypt');
const Time = require("../models/time");
const decoded = require("../service/decoded");
const kirilLotin = require("../service/kirilLotin");
const mongoose = require("mongoose")


const all = async (req, res) => {
    let userFunction = decoded(req,res)
    let quantity = req.query.quantity || 20;
    let next = req.query.next || 1;
    next = (next-1)*quantity;
    let title = req.query.title || null;
    let times = [];
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
    times = await Time.find({...fil, userId:userFunction.id })
        .sort({order:1})
        .limit(quantity)
        .skip(next).lean();
    const count = await Time.find({...fil, userId:userFunction.id }).count();

    res.status(200).json({ times, count });
}


const allActive = async (req, res) => {
    let userFunction = decoded(req,res)
    let times = await Time.find({ userId:userFunction.id, status:1 }).lean()
    res.status(200).json(times);
}

const changeStatus = async (req, res) => {
    if (req.params.id) {
        const _id = req.params.id
        let status = req.query.status;
        let time = await Time.findOne({_id}).lean()
        if(req.query.status) {
            time.status = parseInt(status)
        } else {
            time.status = time.status == 0 ? 1 : 0
        }
        let upstatus = await Time.findByIdAndUpdate(_id,time)
        let saveTime = await Time.findOne({_id:_id}).lean()
        res.status(200).send(saveTime)
    } else {
        res.ststus(400).send({message: "Id topilmadi"})
    }
}

const create = async (req, res) => {
    try {
        let userFunction = decoded(req,res)
        const time = await new Time({ ...req.body,userId:userFunction.id,  createdTime:Date.now() });
        await time.validate();
        await time.save();
        let newTime = await Time.findOne({_id:time._id}).lean()
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
        let { _id, title,order } = req.body;
        let time = await Time.findOneAndUpdate({_id:_id},{ title,order, updateTime:Date.now()}, {returnDocument: 'after'});
        let saveTime = await Time.findOne({_id:time._id}).lean();
        res.status(200).json(saveTime);
    } else {
        res.status(400).json({message: "Id topilmadi"});
    }

}

const findOne = async (req, res) => {
    if (req.params.id) {
        const _id = req.params.id;
        let time = await Time.findOne({_id: _id}).lean();
        res.status(200).json(time);
    } else {
        res.status(400).json({message: "Id topilmadi"});
    }
}

const del = async(req,res)=>{
    if (req.params.id) {
        let _id = req.params.id;
        let time = await Time.findByIdAndDelete(_id);
        res.status(200).json({message:'Удалено!', data: time._id});
    } else {
        res.status(400).json({message: "Id topilmadi"});
    }
}


module.exports = { all, allActive, changeStatus, create, update, findOne, del }