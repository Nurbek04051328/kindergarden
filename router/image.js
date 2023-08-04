const Router = require("express");
const router = new Router();
const auth = require('../middleware/auth');
const {  createAvatar, createImg,  deleteImg } = require('../controllers/image');


router.post("/avatar", auth,  createAvatar);

router.post("/product", auth, createImg);

router.post("/del", auth, deleteImg);






module.exports = router;