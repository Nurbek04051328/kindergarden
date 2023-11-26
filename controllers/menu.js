const bcrypt = require('bcrypt');
const Time = require("../models/time");
const Product = require("../models/product");
const Food = require("../models/food");
const Menu = require("../models/menu");
const decoded = require("../service/decoded");
const kirilLotin = require("../service/kirilLotin");
const mongoose = require("mongoose")
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
    let data = req.query.data || null;
    let from = req.query.from || null
    let to = req.query.to || null
    let menus = [];
    let fil = {};
    // let othername = kirilLotin.kirlot(title)
    if (product) fil = {...fil, product};
    if (data) fil = {...fil, data: data};
    if (from) fil = {...fil, data: { $gte: from }};
    if (to) fil = {...fil, data: { $lte: to }};
    // console.log(req.query)
    menus = await Menu.find({...fil, userId:userFunction.id })
        .populate(['food', 'product', 'time' ])
        .sort({_id:-1})
        .limit(quantity)
        .skip(next).lean();
    // console.log(menus)
    const count = await Menu.find({...fil, userId:userFunction.id }).count();

    res.status(200).json({ menus, count });
}


const getMoth = (cycleNum, data) => {
    let array = []
    for (let i = 1; i <= cycleNum; i++) {
        array.push(data[i] || false )
    }
    return array
}



const filter = async (req, res) => {
    let userFunction = decoded(req,res);
    let month = req.query.month;

    console.log(month)
    const date = new Date()
    const currentYear = date.getFullYear()
    const currentMonth = parseInt(month) || date.getMonth()

    let daysInMonth = new Date(currentYear, currentMonth +1, 0).getDate()


    let fil = {
        data: {
            $gte: new Date(currentYear, currentMonth, 1),
            $lte: new Date(currentYear, currentMonth +1, 0)
        }
    }

    let menusByDay = {}
    let menus = await Menu.find({ userId:userFunction.id, ...fil }).populate(['food', 'product', 'time' ]).lean()
    menus.forEach(item => {
        let menuDate = new Date(item.data);
        let day = menuDate.getDate();

        if (!menusByDay[day]) {
            menusByDay[day] = false
        }
        menusByDay[day] = true
    })

    let menusByDayAArray = getMoth(daysInMonth, menusByDay )
    console.log(menusByDayAArray)
    console.log(menusByDay)
    res.status(200).json(menusByDayAArray);
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
        let userFunction = decoded(req,res)
        // console.log(req.body)
        let result = await Promise.all(req.body.map( async (item) => {
            const menu = await new Menu({ userId:userFunction.id, createdTime:Date.now(), ...item });
            await menu.validate();
            await menu.save();
        }))
        return res.status(201).json(result);
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
    if (req.body) {
        let userFunction = decoded(req,res)
        console.log(req.body)
        let arr = req.body
        let data = await Promise.all(arr.map( async (item) => {
            if (item.id) {
                await Menu.findOneAndUpdate({_id: item.id}, {
                    ...item,
                    updateTime: Date.now()
                }, {returnDocument: 'after'});
            } else {
                console.log("else", item)
                const menu = await new Menu({ userId:userFunction.id, createdTime:Date.now(), ...item });
                await menu.validate();
                await menu.save();
                console.log("menu",menu)
                return item
            }

        }))
        res.status(200).json('ok');
    } else {
        res.status(400).json({message: "Id topilmadi"});
    }

}

const findOne = async (req, res) => {
    if (req.params.data) {
        let data = req.params.data;
        data = new Date(data)
        let minDate = new Date(data.getFullYear(),data.getMonth(),data.getDate())
        console.log(minDate)
        let menu = await Menu.find({data:minDate}).populate(['food', 'product' ]).lean();
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




// // EXCELL
//
// const excell = async (req, res, next) => {
//     try {
//
//         let product = req.query.product || null
//         let product = req.query.product || null;
//         let data = req.query.data || null;
//         let from = req.query.from || null
//         let to = req.query.to || null
//         let menus = [];
//         let fil = {};
//         if (product) fil = {...fil, product};
//         if (data) fil = {...fil, data: data};
//         if (from) fil = {...fil, data: { $gte: from }};
//         if (to) fil = {...fil, data: { $lte: to }};
//
//
//
//         menus = await Menu.find( {...fil}).populate(['food', 'product', 'time' ]).sort({data:-1}).lean()
//
//         // let count = await Book.find().select(['_id']).count()
//         const workbook = new ExcelJs.Workbook()
//         const worksheet = workbook.addWorksheet('Document');
//
//         worksheet.columns = [
//             {header: 'N', key: 'id', width: 10},
//             {header: 'Mahsulot nomi', key: 'product', width: 70},
//             {header: 'Ovqat nomi', key: 'food', width: 70},
//             {header: 'Narxi', key: 'price', width: 70},
//             {header: 'Sanasi', key: 'data', width: 70},
//         ];
//         if (priceProducts.length>0) {
//             priceProducts.forEach((priceproduct, index) => {
//                 worksheet.addRow({
//                     id: index + 1,
//                     product: priceproduct.product.title,
//                     price: priceproduct.price,
//                     data: priceproduct.data,
//
//                 })
//             })
//         }
//         worksheet.getRow(1).eachCell((cell) => {
//             cell.font = {bold: true};
//             cell.alignment = { vertical: 'middle', horizontal: 'center' };
//         });
//         let rows = worksheet.getRows(2, priceProducts.length)
//         rows.forEach(el=>{
//             el.eachCell((cell)=> {
//                 cell.alignment = { vertical: 'middle', horizontal: 'center' };
//             });
//         })
//         let filename = path.join(__dirname, '../files/excel', 'priceproduct.xlsx')
//         await workbook.xlsx.writeFile(filename)
//         res.status(200).send("files/excel/priceproduct.xlsx")
//     } catch (e) {
//         console.log(e)
//         res.status(500).send({message: "Serverda xatolik"})
//     }
// }


module.exports = { all, allActive, changeStatus, create, update, findOne, del, filter }