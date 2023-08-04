const jwt = require('jsonwebtoken');
require('dotenv').config()


function decoded (req,res){

    const token = req.headers.authorization.split(' ')[1]
    if (!token) {
        return res.status(401).json({message: "Auth error"})
    }
    const decoded = jwt.verify(token, process.env.SecretKey)
    return decoded

}

module.exports = decoded