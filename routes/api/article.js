const router = require('koa-router')()
const articleController = require('../../app/controllers/article-controller');

router.get('/get', articleController.getArticle);
router.get('/feeds', articleController.getArticleFeeds);

router.post('/top', articleController.toTopArticle);
router.get('/top', articleController.toTopArticle);

router.post('/save', articleController.updateArticle);
router.get('/save', articleController.updateArticle);

router.post('/add', articleController.createArticle);
router.get('/add', articleController.createArticle);

router.post('/comment', articleController.commentArticle);
router.get('/comment', articleController.commentArticle);

router.post('/remove', articleController.removeArticle);
router.get('/remove', articleController.removeArticle);



module.exports = router;