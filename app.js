const Koa = require('koa');
const app = new Koa();
const router = require('koa-router')();
const views = require('koa-views');
const co = require('co');
const convert = require('koa-convert');
const json = require('koa-json');
const onerror = require('koa-onerror');
// const md5 = require('md5')
// console.log(md5('brucexie1993'))
const bodyparser = require('koa-bodyparser')({
  formLimit: '5mb',
  jsonLimit: '5mb',
  textLimit: '5mb'
});
const logger = require('koa-logger');
const logUtil = require('./utils/log-util');
const users = require('./routes/users');
const api = require('./routes/api');
const front = require('./routes/front');
const admin = require('./routes/admin');
const ueditor = require('./routes/admin/ueditor')
const responseFormatter = require('./middlewares/response-formatter');
const auth = require('./middlewares/basic-auth');
const unauthorizeHandler = require('./middlewares/unauthorize-handler')
const loginChecker = require('./middlewares/login-checker')
const governorChecker = require('./middlewares/governor-checker')
const townsmenChecker = require('./middlewares/townsmen-checker')

const session = require("./app/sdk/session/session");
const RedisStore = require("./app/sdk/session/redisStore");
//const LocalStore = require("./app/sdk/session/store")

//在nginx处做gzip
//const gzip = require('koa-gzip');
//app.use(convert(gzip()))

// middlewares
app.use(convert(bodyparser));
app.use(convert(json()));
app.use(convert(logger()));
app.use(require('koa-static')(__dirname + '/public'));
app.use(views(__dirname + '/views', {
  extension: 'jade'
}));

// logger
app.use(async (ctx, next) => {
  //响应开始时间
  const start = new Date();
  //响应间隔时间
  var ms;
  try {
    //开始进入到下一个中间件
    await next();
    ms = new Date() - start;
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
    //记录响应日志
    logUtil.logResponse(ctx, ms);
  } catch (error) {
    ms = new Date() - start;
    //记录异常日志
    logUtil.logError(ctx, error, ms);
  }
});

app.use(session({
  key: 'SESSIONID',
  store: new RedisStore()
}));

app.use(responseFormatter('^/api'));

app.use(unauthorizeHandler());


//强登逻辑验证
app.use(loginChecker('^/(grzx|fbxf|msdy|smrz|xgzl|bchsb|wddy|wdxf|wdbch|ydbg|xxzx|kqqd|qdxq|gzjh|fbjh|gzrz|xrz|tzgg|fbtz|txl)'))

//管理员权限验证
app.use(auth('^/(admin)|(api/[^/]+/(save|remove|add|update|modify))'))

//政府职员身份认证
app.use(governorChecker('^/(ydbg|gzjh|fbjh|gzrz|xrz|tzgg|fbtz|kqqd|qdxq)'));

//乡贤身份认证
app.use(townsmenChecker('^/(xxzx|xwz)'));


router.use('/ueditor/ue', ueditor.routes(), ueditor.allowedMethods())
router.use('/users', users.routes(), users.allowedMethods());
router.use('/admin', admin.routes(), admin.allowedMethods());
router.use('/', front.routes(), front.allowedMethods());
router.use('/api', api.routes(), api.allowedMethods());

app.use(router.routes(), router.allowedMethods());

app.on('error', function(err, ctx){
  console.log(err)
  //logger.error('server error', err, ctx);
});


module.exports = app;