import { find, findById, update, remove, create } from '../models/diary-model';
const ApiError = require('../error/api-error');
const ApiErrorNames = require('../error/api-error-names');
const userController = require('./user-controller');
const userModel = require('../models/user-model');

const selects = '';

let currentUser;
const getDiaryById = async (ctx, next) => {
  const id = ctx.query.id;
  if (id) {
    try {
      let result = await findById(id)
        .populate('publisher', 'name phone position')
        .populate('publisherDep', 'name')
        .lean()
        .exec();
      result.title = result.title || result.content.substr(0, 10);
      ctx.body = result;
    } catch (e) {
      console.warn(e);
      throw new ApiError(ApiErrorNames.ARTICLE_NOT_EXIST);
    }
  }
};

const getDiarys = async (ctx, next) => {
  // 测试～～～～～～
  // ctx.session.userId = '5900b2cbdc3bfb20933191c7';

  let query = Object.assign({}, ctx.query);
  let type = query.type || 'all';
  let pageSize = query.pageSize, offset = query.offset; //支持分页
  pageSize = pageSize === undefined ? 50 : parseInt(pageSize);
  offset = offset === undefined ? 0 : parseInt(offset);

  delete query.type;
  delete query.offset;
  delete query.pageSize;
  delete query.callback;

  currentUser = await userModel.findById(ctx.session.userId);

  if (type === 'all') {
    //镇长书记
    if (currentUser.level >= 5) {
      let count = await find(query).count();
      let result = [];
      try {
        result = await find(query)
          .populate('publisher', 'name phone position')
          .populate('publisherDep', 'name')
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
    } else {
      throw new ApiError(ApiErrorNames.ACCESS_DENIED);
    }
  } else if (type === 'my') {
    query.publisher = ctx.session.userId;
    let count = await find(query).count();
    let result = [];
    try {
      result = await find(query)
        .populate('publisher', 'name phone position')
        .populate('publisherDep', 'name')
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
  } else if (type === 'department') {
    //部门负责人才可以看
    if (currentUser.level === 4) {
      query.publisherDep = currentUser.department;
      const count = await find(query).count();
      let result = [];
      try {
        result = await find(query)
          .populate('publisher', 'name phone position')
          .populate('publisherDep', 'name')
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
    } else {
      throw new ApiError(ApiErrorNames.ACCESS_DENIED);
    }
  }
};

const updateDiary = async (ctx, next) => {
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

const createDiary = async (ctx, next) => {
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
      currentUser = await userModel.findById(ctx.session.userId);
      try {
        data.publisher = ctx.session.userId;
        data.publisherDep = currentUser.department;
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

const removeDiary = async (ctx, next) => {
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
  getDiaryById,
  getDiarys,
  updateDiary,
  createDiary,
  removeDiary
};
