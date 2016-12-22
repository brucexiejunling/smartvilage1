const router = require('koa-router')()
import {sendCaptchaMsg} from '../../app/controllers/message-controller'

router.get('/captcha', sendCaptchaMsg);
router.post('/captcha', sendCaptchaMsg);

module.exports = router;