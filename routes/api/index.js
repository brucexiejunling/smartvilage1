const router = require('koa-router')();
const pageRouter = require('./page');
const articleRouter = require('./article');
const departmentRouter = require('./department');
const messageRouter = require('./message');
const userRouter = require('./user');
const consultRouter = require('./consult');
const planRouter = require('./plan');
const noticeRouter = require('./notice');
const diaryRouter = require('./diary');
const questionRouter = require('./question');
const disasterRouter = require('./disaster');
const newsRouter = require('./news');
const fileRouter = require('./file');

router.use('/page', pageRouter.routes(), pageRouter.allowedMethods());
router.use('/article', articleRouter.routes(), articleRouter.allowedMethods());
router.use('/department', departmentRouter.routes(), departmentRouter.allowedMethods());
router.use('/message', messageRouter.routes(), messageRouter.allowedMethods());
router.use('/user',userRouter.routes(), userRouter.allowedMethods());
router.use('/plan', planRouter.routes(), planRouter.allowedMethods());
router.use('/notice', noticeRouter.routes(), noticeRouter.allowedMethods());
router.use('/diary', diaryRouter.routes(), diaryRouter.allowedMethods());
router.use('/consult',consultRouter.routes(), consultRouter.allowedMethods());
router.use('/question',questionRouter.routes(), questionRouter.allowedMethods());
router.use('/disaster',disasterRouter.routes(), disasterRouter.allowedMethods());
router.use('/news', newsRouter.routes(), newsRouter.allowedMethods());
router.use('/file', fileRouter.routes(), fileRouter.allowedMethods())

module.exports = router;