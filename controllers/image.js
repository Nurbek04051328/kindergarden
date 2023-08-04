
const fs = require('fs')
const sharp = require('sharp');

// sharp  function
function toSharp(value, way) {
    sharp(value) // Resize to 300x200 pixels
        .toFormat('webp') // Convert the image to WebP format
        .toFile(`${way}.webp`, (err, info) => {
            if (err) {
                console.error(err);
            } else {
                if (fs.existsSync(value)) {
                    fs.unlinkSync(value)
                }
            }
        });
    return `${way}.webp`
}



// upload Avatar

const createAvatar = async  (req,res) =>{
    if (req.files) {
        let file = req.files.file
        uniquePreffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        filepath = `images/avatar/${uniquePreffix}_${file.name}`

        await file.mv(filepath)
        let tosend = toSharp(filepath, `images/avatar/${uniquePreffix}`)
        res.status(200).send(tosend)
    }

}

// upload Product image

const createImg = async  (req,res) =>{
    if (req.files) {
        console.log(req.files)
        let file = req.files.file
        uniquePreffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        filepath = `images/product/${uniquePreffix}_${file.name}`

        await file.mv(filepath)
        let tosend = toSharp(filepath, `images/product/${uniquePreffix}`)
        res.status(200).send(tosend)
    }

}

// delete Image
const deleteImg = async (req,res)=>{
    let delFiles = req.body.file
    if (fs.existsSync(delFiles)) {
        fs.unlinkSync(delFiles)
    }
    res.status(200).send({message: "Успешно"})
}



module.exports = { createAvatar, createImg,  deleteImg }