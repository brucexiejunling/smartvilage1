const router = require('koa-router')()
const consultController = require('../../app/controllers/consult-controller');

router.get('/list', consultController.getConsults);

router.post('/save', consultController.updateConsult);
router.get('/save', consultController.updateConsult);

router.post('/add', consultController.createConsult);
router.get('/add', consultController.createConsult);

router.post('/remove', consultController.removeConsult);
router.get('/remove', consultController.removeConsult);

module.exports = router;