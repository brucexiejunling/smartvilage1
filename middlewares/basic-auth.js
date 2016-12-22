/**
 * Module dependencies.
 */

const auth = require('basic-auth');
const adminController = require('../app/controllers/admin-controller')
//const assert = require('assert');

/**
 * Return basic auth middleware with
 * the given options:
 *
 *  - `name` username
 *  - `pass` password
 *
 * @param {Object} opts
 * @return {GeneratorFunction}
 * @api public
 */

export default function(pattern){
    //const opts = {name: 'bruce', pass: '123900'};
    //
    //assert(opts.name, 'basic auth .name required');
    //assert(opts.pass, 'basic auth .pass required');

    return async function basicAuth(ctx, next){
        const reg = new RegExp(pattern);
        let originalUrl = ctx.originalUrl
        //除了用户可以自主更新资料之外，其他的都是admin操作，需要验证
        const userAction = /(user|question|disaster|consult)\/(save|add)/.test(originalUrl)
        if(reg.test(originalUrl) && !userAction && !ctx.session.isAdmin) {

            const user = auth(ctx);
            if (user && user.name && user.pass) {
                const isValid = await adminController.isAdmin(user.name, user.pass)
                if(isValid) {
                    ctx.session.isAdmin = true
                    await next()
                } else {
                    ctx.throw(401);
                }
            } else {
                ctx.throw(401);
            }
        } else {
            await next()
        }
    };
};