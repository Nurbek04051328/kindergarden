const Router = require("express");
const router = new Router();
const auth = require('../middleware/auth');
const { all  } = require('../controllers/home');


router.get('/', auth,  all);




module.exports = router;