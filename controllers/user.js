const bcrypt = require('bcrypt');
const User = require("../models/user");
const mongoose = require("mongoose")


const all = async (req, res) => {
    try {
        let quantity = req.query.quantity || 20;
        let next = req.query.next || 1;
        next = (next-1) * quantity;
        let name = req.query.name || null;
        let users = [];
        let fil = {};
        if (name) fil = {...fil, 'name': { $regex: new RegExp( name.toLowerCase(), 'i')}};
        users = await User.find({...fil})
            .sort({_id:-1})
            .limit(quantity)
            .skip(next).lean();
            users = users.map(item => {
                item.createdAt = item.createdAt.toLocaleString("en-GB")
            return item
        })
        let count = await User.find({...fil}).count();
        res.status(200).json({users, count});
    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}



const changeStatus = async (req, res) => {
    try {
        if (req.params.id) {
            const _id = req.params.id
            let status = req.query.status;
            let user = await User.findOne({_id}).lean()
            if(req.query.status) {
                user.status = parseInt(status)
            } else {
                user.status = user.status == 0 ? 1 : 0
            }
            let upstatus = await User.findByIdAndUpdate(_id,user, {returnDocument: 'after'})
            let saveUser = await User.findOne({_id:upstatus._id}).lean()
            saveUser.createdAt = saveUser.createdAt.toLocaleString("en-GB")
            res.status(200).send(saveUser)
        } else {
            res.ststus(400).send({message: "Id не найдено"})
        }
    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}

const create = async (req, res) => {
    try {
        let { login, password, type, avatar, name, phone, status } = req.body;
        status = status || 1
        let role = ''
        login = login.toLowerCase()
        const haveLogin = await User.findOne({login});  
        if (haveLogin) {
            return res.status(400).json({message: `Такой логин есть`});
        }
        const hashPass = await bcrypt.hash(password, 10);
        (type == 1) ? role = 'bugalter' : role = 'inventor'
        let newUser =  new User({ login, password:hashPass, name, phone, avatar, status, createdAt:Date.now() });
        await newUser.validate();
        await newUser.save();
        return res.status(201).json(newUser);
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
    try {
        if (req.params.id) {
            let id = req.params.id;
            let { login, password, type, avatar, name, phone, status } = req.body;
            let factorAdmin = await FactorAdmin.findOneAndUpdate({_id:id},{ name, phone, email, updateAt:Date.now()}, {returnDocument: 'after'});
            let userId = factorAdmin.user._id;
            let user = await User.findOne({_id: userId});
            user.login = login;
            if(password) {
                const hashPass = await bcrypt.hash(password, 10);
                user.password = hashPass;
            }
            await User.findByIdAndUpdate(user._id,user);
            let saveFactorAdmin = await FactorAdmin.findOne({_id:factorAdmin._id}).populate([
                {path:"user",model:User, select:'login role'}
            ]).lean();
            saveFactorAdmin.createdAt = saveFactorAdmin.createdAt.toLocaleString("en-GB")
            res.status(200).json(saveFactorAdmin);
        } else {
            res.status(500).json({message: "Не найдено id"});
        }
    } catch (e) {
        console.log(e);
        res.send({message: "Ошибка сервера"});
    }
}

const findOne = async (req, res) => {
    try {
        const _id = req.params.id;
        let user = await User.findOne({_id}).lean();
        res.status(200).json(user);
    } catch (e) {
        console.log(e);
        res.send({message: "Ошибка сервера"});
    }
}

const del = async(req,res)=>{
    if (req.params.id) {
        let _id = req.params.id
        let user = await User.findByIdAndDelete(_id);
        res.status(200).json({message:'Удалено!', data: user._id});
    } else {
        console.log(e);
        res.status(500).send({message: "Не найдено"});
    }
}


module.exports = { all,  changeStatus, create, update, findOne, del }