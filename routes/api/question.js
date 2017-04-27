const router = require('koa-router')()
const QuestionController = require('../../app/controllers/question-controller');

router.get('/list', QuestionController.getQuestions);
router.get('/get', QuestionController.getQuestionById);

router.post('/save', QuestionController.updateQuestion);
router.get('/save', QuestionController.updateQuestion);

router.post('/add', QuestionController.createQuestion);
router.get('/add', QuestionController.createQuestion);

router.post('/reply', QuestionController.replyQuestion);
router.get('/reply', QuestionController.replyQuestion);

router.post('/remove', QuestionController.removeQuestion);
router.get('/remove', QuestionController.removeQuestion);

module.exports = router;