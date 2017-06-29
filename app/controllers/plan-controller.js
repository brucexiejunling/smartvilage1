import { find, findById, update, remove, create } from '../models/plan-model';
const ApiError = require('../error/api-error');
const ApiErrorNames = require('../error/api-error-names');
const userController = require('./user-controller');
const userModel = require('../models/user-model');

const selects = '';

let currentUser;
const getPlanById = async (ctx, next) => {
  //测试～～～～～～
  // ctx.session.userId = '5900b2cbdc3bfb20933191c7';

  const id = ctx.query.id;
  if (id) {
    try {
      let result = await findById(id)
        .populate('publisher', 'name phone address')
        .populate('receiver', 'name')
        .populate('receiverDepartment', 'name')
        .populate('handlers.user', 'name')
        .lean()
        .exec();
      result.title = result.title || result.content.substr(0, 10);

      currentUser = await userModel.findById(ctx.session.userId);

      if(!currentUser) {
        throw new ApiError(ApiErrorNames.USER_NOT_LOGIN);
      }

      result.isMy = false;
      if (
        result.publisher &&
        ctx.session.userId + '' === result.publisher._id + ''
      ) {
        result.isMy = true;
        let unhandlers = [];
        if (result.receiverType === 2) {
          const persons = await userModel
            .find({ department: result.receiverDepartment._id })
            .where('level')
            .gte(3)
            .select('_id name')
            .lean()
            .exec();
          unhandlers = persons.filter(p => {
            const ret = result.handlers.filter(h => {
              return p._id + '' === h.user._id + '';
            });
            return ret.length === 0;
          });
        } else if (result.receiverType === 3) {
          const persons = await userModel
            .find({})
            .where('level')
            .gte(3)
            .select('_id name')
            .lean()
            .exec();
          unhandlers = persons.filter(p => {
            const ret = result.handlers.filter(h => {
              return p._id + '' === h.user._id + '';
            });
            return ret.length === 0;
          });
        } else if (result.receiverType === 1) {
          if (result.handlers.length === 0) {
            unhandlers.push(result.receiver);
          }
        }
        result.unhandlers = unhandlers;
      }

      //如果是发送给我的，加上一些处理信息
      if (
        result.receiver + '' === ctx.session.userId + '' ||
        result.receiverDepartment + '' === currentUser.department + '' ||
        result.receiverType === 3
      ) {
        let me = result.handlers.filter(h => {
          return h.user + '' === ctx.session.userId + '';
        });
        result.status = 0;
        if (me[0]) {
          result.status = me[0].status;
          result.result = me[0].result;
          result.resultImgs = me[0].imgs;
        }
      }
      ctx.body = result;
    } catch (e) {
      console.warn(e);
      throw new ApiError(ApiErrorNames.ARTICLE_NOT_EXIST);
    }
  }
};

const getPlans = async (ctx, next) => {
  //测试～～～～～～
  // ctx.session.userId = '58529ae8ae6fd22d9d9cd824';

  let query = Object.assign({}, ctx.query);
  let type = query.type || 'all';
  let pageSize = query.pageSize, offset = query.offset; //支持分页
  pageSize = pageSize === undefined ? 50 : parseInt(pageSize);
  offset = offset === undefined ? 0 : parseInt(offset);

  delete query.type;
  delete query.offset;
  delete query.pageSize;
  delete query.callback;
  if (type === 'all') {
    let count = await find(query).count();
    let result = [];
    try {
      result = await find(query)
        .populate('publisher', 'name age gender phone idNumber address')
        .populate('receiverDepartment', 'name')
        .populate('receiver', 'name')
        .sort({ _id: -1 })
        .skip(offset)
        .limit(pageSize)
        .lean()
        .exec();
      ctx.body = {
        total: count,
        data: result
      };
    } catch (e) {
      throw new ApiError(ApiErrorNames.UNKNOW_ERROR);
    }
  } else if (type === 'my') {
    query.publisher = ctx.session.userId;
    let count = await find(query).count();
    let result = [];
    try {
      result = await find(query)
        .populate('publisher', 'name age gender phone idNumber address')
        .populate('receiverDepartment', 'name')
        .populate('receiver', 'name')
        .sort({ _id: -1 })
        .skip(offset)
        .limit(pageSize)
        .lean()
        .exec();
      result.forEach((item)=> {
        item.isMy = true;
      })
      ctx.body = {
        total: count,
        data: result
      };
    } catch (e) {
      throw new ApiError(ApiErrorNames.UNKNOW_ERROR);
    }
  } else if (type === 'relative') {
    currentUser = await userModel.findById(ctx.session.userId);
    const count = await find(query)
      .or([
        { receiver: ctx.session.userId },
        { receiverDepartment: currentUser.department },
        { receiverType: 3 }
      ])
      .count();
    let result = [];
    try {
      result = await find(query)
        .or([
          { receiver: ctx.session.userId },
          { receiverDepartment: currentUser.department },
          { receiverType: 3 }
        ])
        .populate('publisher', 'name age gender phone idNumber address')
        .populate('receiverDepartment', 'name')
        .populate('receiver', 'name')
        .sort({ _id: -1 })
        .skip(offset)
        .limit(pageSize)
        .lean()
        .exec();
      result.forEach((p, idx) => {
        let me = p.handlers.filter(h => {
          return h.user + '' === ctx.session.userId + '';
        });
        p.status = 0;
        if (me[0]) {
          p.status = me[0].status;
          p.result = me[0].result;
          p.resultImgs = me[0].imgs;
        }
      });
      ctx.body = {
        total: count,
        data: result
      };
    } catch (e) {
      throw new ApiError(ApiErrorNames.UNKNOW_ERROR);
    }
  }
};

const updatePlan = async (ctx, next) => {
  let param;
  if (ctx.method === 'GET') {
    param = ctx.request.query;
  } else {
    param = ctx.request.body;
  }
  const id = param.id;
  if (id) {
    let data = param.data;
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        data = null;
      }
    }
    if (data) {
      try {
        const result = await update(id, data);
        ctx.body = {
          data: result
        };
      } catch (e) {
        throw new ApiError(ApiErrorNames.UNKNOW_ERROR);
      }
    } else {
      throw new ApiError(ApiErrorNames.PARAM_ILLEGAL);
    }
  } else {
    throw new ApiError(ApiErrorNames.PARAM_ILLEGAL);
  }
};

const replyPlan = async (ctx, next) => {
  //测试～～～～～～
  // ctx.session.userId = '592306822ec3727cb2607352';
  if (!ctx.session.userId) {
    throw new ApiError(ApiErrorNames.USER_NOT_LOGIN);
  } else {
    let param;
    if (ctx.method === 'GET') {
      param = ctx.request.query;
    } else {
      param = ctx.request.body;
    }
    const id = param.id;
    if (id) {
      let data = param.data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {
          data = null;
        }
      }
      if (data) {
        let plan = await findById(id).lean().exec();
        let handlers = plan.handlers || [];
        let handler = {
          user: ctx.session.userId
        };
        //移除掉之前的
        handlers = handlers.filter((h, idx) => {
          return h.user + '' !== ctx.session.userId + '';
        });
        Object.assign(handler, data);
        currentUser = await userModel.findById(ctx.session.userId);
        handler.username = currentUser.name;
        handlers.push(handler);
        try {
          const result = await update(id, { handlers });
          ctx.body = {
            data: result
          };
        } catch (e) {
          throw new ApiError(ApiErrorNames.UNKNOW_ERROR);
        }
      } else {
        throw new ApiError(ApiErrorNames.PARAM_ILLEGAL);
      }
    } else {
      throw new ApiError(ApiErrorNames.PARAM_ILLEGAL);
    }
  }
};

const createPlan = async (ctx, next) => {
  let data;
  //测试
  // ctx.session.userId = '58529ae8ae6fd22d9d9cd824';

  if (!ctx.session.userId) {
    throw new ApiError(ApiErrorNames.USER_NOT_LOGIN);
  } else {
    const isRealname = await userController.isRealname(ctx.session.userId);
    if (!isRealname) {
      throw new ApiError(ApiErrorNames.USER_NOT_REALNAME);
    }
    if (ctx.method === 'GET') {
      data = ctx.request.query.data;
    } else {
      data = ctx.request.body.data;
    }
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        data = null;
      }
    }
    if (data) {
      try {
        data.publisher = ctx.session.userId;
        const result = await create(data);
        ctx.body = result;
      } catch (e) {
        throw new ApiError(ApiErrorNames.UNKNOW_ERROR);
      }
    } else {
      throw new ApiError(ApiErrorNames.PARAM_ILLEGAL);
    }
  }
};

const removePlan = async (ctx, next) => {
  let param;
  if (ctx.method === 'GET') {
    param = ctx.request.query;
  } else {
    param = ctx.request.body;
  }
  const id = param.id;
  if (id) {
    try {
      const result = await remove(id);
      ctx.body = result;
    } catch (e) {
      throw new ApiError(ApiErrorNames.UNKNOW_ERROR);
    }
  } else {
    throw new ApiError(ApiErrorNames.PARAM_ILLEGAL);
  }
};

module.exports = {
  getPlanById,
  getPlans,
  updatePlan,
  replyPlan,
  createPlan,
  removePlan
};
