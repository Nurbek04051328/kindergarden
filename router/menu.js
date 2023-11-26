const Router = require("express");
const router = new Router();
const auth = require('../middleware/auth');
const { all, allActive, changeStatus, create, update, findOne, del, filter} = require('../controllers/menu');


router.get('/', auth,  all);

router.get('/all', auth,  filter);



router.get('/active', auth,  allActive);

router.post("/", auth, create);

router.put('/', auth, update);

router.get("/change/:id", auth, changeStatus);

router.get("/:data", auth, findOne);

router.delete('/:id', auth,  del);




module.exports = router;