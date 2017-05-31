const router = require('koa-router')();
const userController = require('../../app/controllers/user-controller')

router.get('/', async function(ctx, next) {
    ctx.state = {
       title: '首页'
    }
    await ctx.render('front/home', {});
})
router.get('jzfp', async function (ctx, next) {
    ctx.state = {
        title: '精准扶贫'
    };

    await ctx.render('front/jzfp', {});
})

router.get('ddjs', async function (ctx, next) {
    ctx.state = {
        title: '党的建设'
    };

    await ctx.render('front/ddjs', {});
})

router.get('wybs', async function (ctx, next) {
    ctx.state = {
        title: '我要办事'
    };

    await ctx.render('front/wybs', {});
})

router.get('zxxf', async function (ctx, next) {
    ctx.state = {
        title: '在线信访'
    };

    await ctx.render('front/zxxf', {});
})

router.get('fbxf', async function (ctx, next) {
    const isRealname = await userController.isRealname(ctx.session.userId)
    ctx.state = {
        title: '发布信访',
        isRealname: isRealname + ''
    };

    await ctx.render('front/fbxf', {});
})

router.get('njzx', async function (ctx, next) {
    ctx.state = {
        title: '农技在线'
    };

    await ctx.render('front/njzx', {});
})

router.get('bchsb', async function (ctx, next) {
    const isRealname = await userController.isRealname(ctx.session.userId)
    ctx.state = {
        title: '病虫害上报',
        isRealname: isRealname + ''
    };

    await ctx.render('front/bchsb', {});
})

router.get('kjzf', async function (ctx, next) {
    ctx.state = {
        title: '科技致富'
    };

    await ctx.render('front/kjzf', {});
})

router.get('msdy', async function (ctx, next) {
    const isRealname = await userController.isRealname(ctx.session.userId)
    ctx.state = {
        title: '民生答疑',
        isRealname: isRealname + ''
    };

    await ctx.render('front/msdy', {});
})

router.get('login', async function (ctx, next) {
    ctx.state = {
        title: '登陆'
    };

    await ctx.render('front/login', {});
})
router.get('register', async function (ctx, next) {
    ctx.state = {
        title: '注册'
    };

    await ctx.render('front/register', {});
})
router.get('grzx', async function (ctx, next) {
    ctx.state = {
        title: '个人中心'
    };

    await ctx.render('front/grzx', {});
})
router.get('wzxq', async function (ctx, next) {
    ctx.state = {
        title: '文章详情'
    };

    await ctx.render('front/wzxq', {});
})

router.get('smrz', async function (ctx, next) {
    ctx.state = {
        title: '实名认证'
    };

    await ctx.render('front/smrz', {});
})

router.get('xgzl', async function (ctx, next) {
    ctx.state = {
        title: '修改资料'
    };

    await ctx.render('front/xgzl', {});
})

router.get('xxzx', async function (ctx, next) {
    ctx.state = {
        title: '乡贤在线'
    };

    await ctx.render('front/xxzx', {});
})

router.get('ydbg', async function (ctx, next) {
    ctx.state = {
        title: '移动办公'
    };

    await ctx.render('front/ydbg', {});
})

router.get('wdbch', async function (ctx, next) {
    ctx.state = {
        title: '我的病虫害上报'
    };

    await ctx.render('front/wdbch', {});
})

router.get('wddy', async function (ctx, next) {
    ctx.state = {
        title: '我的民生答疑'
    };

    await ctx.render('front/wddy', {});
})

router.get('wdxf', async function (ctx, next) {
    ctx.state = {
        title: '我的在线信访'
    };

    await ctx.render('front/wdxf', {});
})

router.get('gzjh', async function (ctx, next) {
    ctx.state = {
        title: '工作计划'
    };

    await ctx.render('front/gzjh', {});
})

router.get('fbjh', async function (ctx, next) {
    ctx.state = {
        title: '发布工作计划'
    };

    await ctx.render('front/fbjh', {});
})

router.get('tzgg', async function (ctx, next) {
    ctx.state = {
        title: '通知公告'
    };

    await ctx.render('front/tzgg', {});
})

router.get('fbtz', async function (ctx, next) {
    ctx.state = {
        title: '发布通知公告'
    };

    await ctx.render('front/fbtz', {});
})

router.get('gzrz', async function (ctx, next) {
    ctx.state = {
        title: '工作日志'
    };

    await ctx.render('front/gzrz', {});
})

router.get('xrz', async function (ctx, next) {
    ctx.state = {
        title: '写日志'
    };

    await ctx.render('front/xrz', {});
})

router.get('txl', async function (ctx, next) {
    ctx.state = {
        title: '通讯录'
    };

    await ctx.render('front/txl', {});
})

router.get('xwz', async function (ctx, next) {
    ctx.state = {
        title: '写文章'
    };

    await ctx.render('front/xwz', {});
})

router.get('swxq', async function (ctx, next) {
    ctx.state = {
        title: '详情'
    };

    await ctx.render('front/swxq', {});
})

router.get('kqqd', async function (ctx, next) {
    ctx.state = {
        title: '考勤签到'
    };

    await ctx.render('front/kqqd', {});
})

router.get('qdxq', async function (ctx, next) {
    ctx.state = {
        title: '签到详情'
    };

    await ctx.render('front/qdxq', {});
})



module.exports = router;