const router = require('koa-router')()
const noticeController = require('../../app/controllers/notice-controller');

router.get('/get', noticeController.getNoticeById);

router.get('/list', noticeController.getNotices);

router.post('/read', noticeController.readNotice);
router.get('/read', noticeController.readNotice);

router.post('/save', noticeController.updateNotice);
router.get('/save', noticeController.updateNotice);

router.post('/add', noticeController.createNotice);
router.get('/add', noticeController.createNotice);

router.post('/remove', noticeController.removeNotice);
router.get('/remove', noticeController.removeNotice);

module.exports = router;