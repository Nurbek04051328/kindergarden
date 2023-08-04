const Router = require("express");
const router = new Router();
const auth = require('../middleware/auth');
const { register, login, checkUser, getUser, checkLogin } = require("../controllers/auth");



router.post('/reg', register);

router.get('/checkuser',auth, checkUser);

router.post('/checklogin', checkLogin);

router.post('/login', login);

router.get('/getuser', auth, getUser);


module.exports = router;