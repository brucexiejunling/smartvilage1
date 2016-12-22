module.exports = function(pattern) {
    const reg = new RegExp(pattern);
    return async(ctx, next) => {
        if(reg.test(ctx.originalUrl)) {
            if(!ctx.session.userId) {
                let loginUrl = '/login?redirectURL=' + encodeURIComponent(ctx.originalUrl)
                ctx.redirect(loginUrl)
            }
            await next()
        } else {
            await next()
        }
    }
}
