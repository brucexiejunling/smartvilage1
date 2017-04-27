const UserModel = require('../app/models/user-model');
module.exports = function(pattern) {
    const reg = new RegExp(pattern);
    return async(ctx, next) => {
        if(reg.test(ctx.originalUrl)) {
            let currentUser = await UserModel.findById(ctx.session.userId);
            if(currentUser.level >= 3) {
              await next();
            } else {
              ctx.throw(402);
            }
        } else {
            await next()
        }
    }
}