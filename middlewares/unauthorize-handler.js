module.exports = function() {
    return async function (ctx, next) {
        try {
            await next();
        } catch (err) {
            if (401 == err.status)  {
                ctx.status = 401;
                ctx.set('WWW-Authenticate', 'Basic');
                ctx.body = '对不起，您没有权限访问！请刷新页面重新进行身份验证！';
            } else if(402 == err.status) {
                ctx.body = '对不起，您不是政府职员，暂无权限访问该页面';
            } else if(403 == err.status) {
                ctx.body = '对不起，您不是乡贤，暂无权限访问该页面';
            }
             else {
                throw err;
            }
        }
    }
}
