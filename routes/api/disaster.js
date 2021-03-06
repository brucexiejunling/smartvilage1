const router = require('koa-router')()
const DisasterController = require('../../app/controllers/disaster-controller');

router.get('/list', DisasterController.getDisasters);

router.get('/get', DisasterController.getDisasterById);

router.post('/save', DisasterController.updateDisaster);
router.get('/save', DisasterController.updateDisaster);

router.post('/add', DisasterController.createDisaster);
router.get('/add', DisasterController.createDisaster);

router.post('/reply', DisasterController.replyDisaster);
router.get('/reply', DisasterController.replyDisaster);

router.post('/remove', DisasterController.removeDisaster);
router.get('/remove', DisasterController.removeDisaster);

module.exports = router;