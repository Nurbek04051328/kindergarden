const Router = require("express");
const router = new Router();
const auth = require('../middleware/auth');
const { all, allActive, changeStatus, create, update, excell, findOne, del } = require('../controllers/priceproduct');


router.get('/', auth,  all);

router.get('/active', auth,  allActive);

router.post("/", auth, create);

router.put('/', auth, update);

router.get("/change/:id", auth, changeStatus);

router.get("/excel", excell);

router.get("/:id", auth, findOne);

router.delete('/:id', auth,  del);




module.exports = router;