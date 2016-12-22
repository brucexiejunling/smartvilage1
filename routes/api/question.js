const router = require('koa-router')()
const QuestionController = require('../../app/controllers/Question-controller');

router.get('/list', QuestionController.getQuestions);

router.post('/save', QuestionController.updateQuestion);
router.get('/save', QuestionController.updateQuestion);

router.post('/add', QuestionController.createQuestion);
router.get('/add', QuestionController.createQuestion);

router.post('/remove', QuestionController.removeQuestion);
router.get('/remove', QuestionController.removeQuestion);

module.exports = router;