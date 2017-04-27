const router = require('koa-router')()
const consultController = require('../../app/controllers/consult-controller');

router.get('/list', consultController.getConsults);

router.get('/get', consultController.getConsultById);

router.post('/save', consultController.updateConsult);
router.get('/save', consultController.updateConsult);

router.post('/reply', consultController.replyConsult);
router.get('/reply', consultController.replyConsult);

router.post('/add', consultController.createConsult);
router.get('/add', consultController.createConsult);

router.post('/remove', consultController.removeConsult);
router.get('/remove', consultController.removeConsult);

module.exports = router;