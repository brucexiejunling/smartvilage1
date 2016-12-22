const router = require('koa-router')()
const fileController = require('../../app/controllers/file-controller');

router.post('/upload', fileController.uploadFile)

router.post('/delete', fileController.deleteFile)

router.get('/list', fileController.listFiles)

module.exports = router;