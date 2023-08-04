const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require("../models/user");
const mongoose = require("mongoose")



const register = async (req, res) => {
    try {
        let {login, password, name} = req.body
        if (login) {
            login = login.toLowerCase()
        } else {
            return res.status(400).send({message: `Login maydoni bo'sh bo'lmasligi kerak`});
        }
        if (password) {
            let check = await User.findOne({login})
            if (check) {
                return res.status(400).json({message: `Bunday foydalanuvchi mavjud`});
            }
            const hashPass = await bcrypt.hash(password, 10)
            let user =  await new User({login, password: hashPass, role: 'admin', name})
            await user.validate();
            await user.save()
            res.status(201).send('ok')
        } else {
            return res.status(400).send({message: `Parol maydoni bo'sh bo'lmasligi kerak`});
        }

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



const login = async (req, res) => {
    console.log(req.body)
    let {login, password} = req.body
    const user = await User.findOne({login})
    if (!user) {
        return res.status(404).send('User topilmadi')
    }
    const isPassValid = bcrypt.compareSync(password, user.password)
    if (!isPassValid) {
        return res.status(400).send('Parolda xatolik bor')
    }
    const token = jwt.sign({id: user.id}, process.env.SecretKey, {expiresIn: "1d"})
    user.loginAt.push(Date.now())
    await User.findByIdAndUpdate(user._id,user);
    let data = {
        id: user.id,
        login: user.login,
        role: user.role,
        name: user.name
    }
    return res.status(200).send({
        token,
        user: data
    })
}


const checkLogin = async(req,res) => {
    let {login} = req.body
    console.log("checklogin", req.body)
    if (login) {
        login = login.toLowerCase()
    }
    const user = await User.findOne({login})
    if (user) {
        res.status(200).send('yes')
    } else {
        res.status(200).send('no')
    }
}


const checkUser = async (req,res) => {
    const user = await User.findOne({_id: req.user.id})
    if (!user){
        return res.status(404).json({message: "Пользователь не найдено!"})
    }
    let data = {
        id: user.id,
        login: user.login,
        role: user.role,
        name: user.name
    }
    res.status(200).json(data)
}

const getUser = async (req, res) => {
    const user = await User.findOne({_id: req.user.id})
    const token = jwt.sign({id: user.id}, process.env.secretKey, {expiresIn: "1d"})
    return res.json({
        token,
        user: {
            id: user.id,
            login: user.login,
        }
    })
}

module.exports = { register, login, checkUser, checkLogin, getUser }