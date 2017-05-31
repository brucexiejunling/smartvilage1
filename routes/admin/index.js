const router = require('koa-router')();

router.redirect('/', '/admin/home')

router.get('/home', async function(ctx, next) {
    ctx.state = {
        title: '网站首页',
        pageName: 'home'
    };

    await ctx.render('admin/home', {});
})

router.get('/bjwz', async function (ctx, next) {
    ctx.state = {
        title: '编辑文章',
        pageName: 'bjwz'
    };

    await ctx.render('admin/bjwz', {});
})

router.get('/xjwz', async function (ctx, next) {
    ctx.state = {
        title: '新建文章',
        pageName: 'xjwz'
    };

    await ctx.render('admin/xjwz', {});
})

router.get('/zhsz', async function (ctx, next) {
    ctx.state = {
        title: '账号设置',
        pageName: 'zhsz'
    };

    await ctx.render('admin/zhsz', {});
})

router.get('/yhgl', async function (ctx, next) {
    ctx.state = {
        title: '用户管理',
        pageName: 'yhgl'
    };

    await ctx.render('admin/yhgl', {});
})

router.get('/smsh', async function (ctx, next) {
    ctx.state = {
        title: '实名审核',
        pageName: 'smsh'
    };

    await ctx.render('admin/smsh', {});
})

router.get('/bmgl', async function (ctx, next) {
    ctx.state = {
        title: '部门管理',
        pageName: 'bmgl'
    };

    await ctx.render('admin/bmgl', {});
})

router.get('/jzfp', async function (ctx, next) {
    ctx.state = {
        title: '精准扶贫',
        pageName: 'jzfp'
    };

    await ctx.render('admin/jzfp', {});
})

router.get('/ddjs', async function (ctx, next) {
    ctx.state = {
        title: '党的建设',
        pageName: 'ddjs'
    };

    await ctx.render('admin/ddjs', {});
})

router.get('/wybs', async function (ctx, next) {
    ctx.state = {
        title: '我要办事',
        pageName: 'wybs'
    };

    await ctx.render('admin/wybs', {});
})

router.get('/zxxf', async function (ctx, next) {
    ctx.state = {
        title: '在线信访',
        pageName: 'zxxf'
    };

    await ctx.render('admin/zxxf', {});
})

router.get('/kjzf', async function (ctx, next) {
    ctx.state = {
        title: '科技致富',
        pageName: 'kjzf'
    };

    await ctx.render('admin/kjzf', {});
})

router.get('/msdy', async function (ctx, next) {
    ctx.state = {
        title: '民生答疑',
        pageName: 'msdy'
    };

    await ctx.render('admin/msdy', {});
})

router.get('/njzx', async function (ctx, next) {
    ctx.state = {
        title: '农技在线',
        pageName: 'njzx'
    };

    await ctx.render('admin/njzx', {});
})

router.get('/tpgl', async function (ctx, next) {
    ctx.state = {
        title: '图片管理',
        pageName: 'tpgl'
    };

    await ctx.render('admin/tpgl', {});
})
router.get('/spgl', async function (ctx, next) {
    ctx.state = {
        title: '视频管理',
        pageName: 'spgl'
    };

    await ctx.render('admin/spgl', {});
})
router.get('/ypgl', async function (ctx, next) {
    ctx.state = {
        title: '音频管理',
        pageName: 'ypgl'
    };

    await ctx.render('admin/ypgl', {});
})
router.get('/wdgl', async function (ctx, next) {
    ctx.state = {
        title: '文档管理',
        pageName: 'wdgl'
    };

    await ctx.render('admin/wdgl', {});
})

router.get('/xxzx', async function (ctx, next) {
    ctx.state = {
        title: '乡贤在线',
        pageName: 'xxzx'
    };

    await ctx.render('admin/xxzx', {});
})

router.get('/kqgl', async function (ctx, next) {
    ctx.state = {
        title: '考勤管理',
        pageName: 'kqgl'
    };

    await ctx.render('admin/kqgl', {});
})

module.exports = router;