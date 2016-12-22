const router = require('koa-router')()
const userController = require('../../app/controllers/user-controller');


router.get('/get', userController.getUser)

router.get('/list', userController.getUsers)

router.post('/register', userController.registerUser)
router.get('/register', userController.registerUser)

router.post('/identify', userController.identifyUser)
router.get('/identify', userController.identifyUser)

router.post('/pass', userController.passIdentify)
router.get('/pass', userController.passIdentify)

router.post('/reject', userController.rejectIdentify)
router.get('/reject', userController.rejectIdentify)

router.post('/login', userController.userLogin)
router.get('/login', userController.userLogin)
//
router.post('/save', userController.updateUser)
router.get('/save', userController.updateUser)
//
//router.post('/remove', userController.removeUser)
//router.get('/remove', userController.removeUser)

module.exports = router;