
const router = require('koa-router')()
const diaryController = require('../../app/controllers/diary-controller');

router.get('/get', diaryController.getDiaryById);

router.get('/list', diaryController.getDiarys);

router.post('/save', diaryController.updateDiary);
router.get('/save', diaryController.updateDiary);

router.post('/add', diaryController.createDiary);
router.get('/add', diaryController.createDiary);

router.post('/remove', diaryController.removeDiary);
router.get('/remove', diaryController.removeDiary);

module.exports = router;