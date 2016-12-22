module.exports = function() {
    return async function (ctx, next) {
        try {
            await next();
        } catch (err) {
            if (401 == err.status) {
                ctx.status = 401;
                ctx.set('WWW-Authenticate', 'Basic');
                ctx.body = '对不起，您没有权限访问！请刷新页面重新进行身份验证！';
            } else {
                throw err;
            }
        }
    }
}
