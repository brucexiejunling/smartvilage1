const router = require('koa-router')()
const newsController = require('../../app/controllers/news-controller');

router.get('/get', newsController.getNews);

module.exports = router;