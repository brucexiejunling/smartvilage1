import {
  find,
  findById,
  update,
  remove,
  create
} from '../models/disaster-model';
const ApiError = require('../error/api-error');
const ApiErrorNames = require('../error/api-error-names');
const messageController = require('./message-controller');
const userController = require('./user-controller');
const userModel = require('../models/user-model');
const departmentModel = require('../models/department-model');

const selects = '';

const getDisasterById = async (ctx, next) => {
  const id = ctx.query.id;
  if (id) {
    try {
      let result = await findById(id)
        .populate('publisher', 'name phone address')
        .populate('department', 'name')
        .populate('modifier', 'name')
        .lean()
        .exec();
      result.title = result.title || result.content.substr(0, 10);
      ctx.body = result;
    } catch (e) {
      throw new ApiError(ApiErrorNames.ARTICLE_NOT_EXIST);
    }
  }
};

const getDisasters = async (ctx, next) => {
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
        .populate('department', 'name')
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
        .populate('department', 'name')
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
  } else if (type === 'relative') {
    let currentUser = await userModel.findById(ctx.session.userId);
    query.department = currentUser.department;
    let count = await find(query).count();
    let result = [];
    try {
      result = await find(query)
        .populate('publisher', 'name age gender phone idNumber address')
        .populate('department', 'name')
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
  }
};

const updateDisaster = async (ctx, next) => {
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

const replyDisaster = async (ctx, next) => {
  //测试～～～～～～
  // ctx.session.userId = '58529ae8ae6fd22d9d9cd824';
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
        data.modifier = ctx.session.userId;
        data.modifyTime = +new Date();
        try {
          const result = await update(id, data);
          ctx.body = {
            data: result
          };
          const issue = await findById(id)
            .populate('publisher', 'name phone')
            .lean()
            .exec();
          messageController.sendReplyNotice(
            issue.publisher.phone,
            issue.publisher.name,
            '病虫害上报'
          );
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

const createDisaster = async (ctx, next) => {
  let data;
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
        let department = await departmentModel.findByName('农技部门');
        if(department.length > 0) {
          data.publisher = ctx.session.userId;
          data.department = department[0]._id;
          data.status = 0;
          const result = await create(data);
          ctx.body = result;
        } else {
          throw new ApiError(ApiErrorNames.DEPARTMENT_NOT_EXIST);
        }
      } catch (e) {
        throw new ApiError(ApiErrorNames.UNKNOW_ERROR);
      }
    } else {
      throw new ApiError(ApiErrorNames.PARAM_ILLEGAL);
    }
  }
};

const removeDisaster = async (ctx, next) => {
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
  getDisasters,
  getDisasterById,
  updateDisaster,
  createDisaster,
  removeDisaster,
  replyDisaster
};
