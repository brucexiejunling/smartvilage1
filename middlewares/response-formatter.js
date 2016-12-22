/**
 * 在app.use(router)之前调用
 */
var responseFormatter = (ctx) => {
    //如果有返回数据，将返回数据添加到data中
    const jsonpCallback = ctx.query.callback;
    let res;
    if (ctx.body) {
        res = {
            code: 0,
            message: 'success',
            data: ctx.body
        }
    } else {
        res = {
            code: 0,
            message: 'success'
        }
    }
    if(jsonpCallback) {
        res = `${jsonpCallback}(${JSON.stringify(res)})`
    }
    ctx.body = res
}

var ApiError = require('../app/error/api-error');

var url_filter = (pattern) => {
    return async (ctx, next) => {
        var reg = new RegExp(pattern);
        try {
            //先去执行路由
            await next();
        } catch (error) {
            //如果异常类型是API异常并且通过正则验证的url，将错误信息添加到响应体中返回。
            if(error instanceof ApiError && reg.test(ctx.originalUrl)){
                const jsonpCallback = ctx.query.callback;
                let res = {
                    code: error.code,
                    message: error.message
                }
                if(jsonpCallback) {
                    res = `${jsonpCallback}(${JSON.stringify(res)})`
                }
                ctx.status = 200;
                ctx.body = res
            }
            //继续抛，让外层中间件处理日志
            throw error;
        }

        //通过正则的url进行格式化处理
        if(reg.test(ctx.originalUrl)){
            responseFormatter(ctx);
        }
    }
}

module.exports = url_filter;