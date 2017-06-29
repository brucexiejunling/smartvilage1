const UserModel = require('../app/models/user-model');
module.exports = function(pattern) {
    const reg = new RegExp(pattern);
    return async(ctx, next) => {
        if(reg.test(ctx.originalUrl)) {
            let currentUser = await UserModel.findById(ctx.session.userId);
            //乡贤和政府人员可以访问
            if(currentUser && currentUser.level >= 2) {
              await next();
            } else {
              ctx.throw(403);
            }
        } else {
            await next()
        }
    }
}