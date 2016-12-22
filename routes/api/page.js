const router = require('koa-router')()
const pageController = require('../../app/controllers/page-controller');

router.get('/get', pageController.getPage);

router.get('/all', pageController.getAllPage);

router.post('/save', pageController.updatePage);
router.get('/save', pageController.updatePage);

router.post('/add', pageController.createPage);
router.get('/add', pageController.createPage);

router.post('/remove', pageController.removePage);
router.get('/remove', pageController.removePage);

module.exports = router;