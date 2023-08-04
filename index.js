const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const fileUpload = require('express-fileupload')


// Routers
const routerList = require('./router.js')

const app = express()
const PORT = process.env.PORT || 3010;

app.use(express.json());
app.use(cors());

app.use(fileUpload({
    limits: {
        fileSize: 1000000*30 //1mb
    },
    abortOnLimit: true
}));
app.use(routerList);

app.use('/images',express.static('images'))
app.use('/files',express.static('files'))







const start = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        app.listen(PORT, () => {
            console.log(`Server ${PORT} da ishladi`);
        })
    } catch (error) {
        console.log(error);

    }
};

start()