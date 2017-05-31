const router = require('koa-router')()
const recordController = require('../../app/controllers/record-controller');

router.get('/set', recordController.setRecord);
router.post('/set', recordController.setRecord);

router.get('/signin', recordController.signin);
router.post('/signin', recordController.signin);

router.get('/signout', recordController.signout);
router.post('/signout', recordController.signout);

router.get('/get', recordController.getRecord);

router.get('/detail', recordController.getRecordDetail);

router.get('/list', recordController.getRecords);


// router.get('/list', recordController.getRecords);

// router.post('/reply', recordController.replyRecord);
// router.get('/reply', recordController.replyRecord);

// router.post('/save', recordController.updateRecord);
// router.get('/save', recordController.updateRecord);

// router.post('/add', recordController.createRecord);
// router.get('/add', recordController.createRecord);

// router.post('/remove', recordController.removeRecord);
// router.get('/remove', recordController.removeRecord);

module.exports = router;