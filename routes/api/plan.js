const router = require('koa-router')()
const planController = require('../../app/controllers/plan-controller');

router.get('/get', planController.getPlanById);

router.get('/list', planController.getPlans);

router.post('/reply', planController.replyPlan);
router.get('/reply', planController.replyPlan);

router.post('/save', planController.updatePlan);
router.get('/save', planController.updatePlan);

router.post('/add', planController.createPlan);
router.get('/add', planController.createPlan);

router.post('/remove', planController.removePlan);
router.get('/remove', planController.removePlan);

module.exports = router;