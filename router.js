const {Router} = require('express');
const router = Router();


router.use('/auth', require("./router/auth"));
router.use('/image', require("./router/image"));
router.use('/product', require("./router/product"));
router.use('/priceprod', require("./router/priceproduct"));
router.use('/food', require("./router/food"));
router.use('/time', require("./router/time"));
router.use('/menu', require("./router/menu"));






module.exports = router