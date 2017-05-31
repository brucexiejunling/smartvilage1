import {
  find,
  findById,
  findByIds,
  update,
  remove,
  create
} from '../models/article-model';
const config = require('../../config/index');
const ApiError = require('../error/api-error');
const ApiErrorNames = require('../error/api-error-names');

const getCommonQueries = q => {
  let query = {};
  // 支持以下查询条件
  if (q.title) {
    query.title = q.title;
  }
  if (q.page) {
    try {
      query.page = JSON.parse(q.page);
    } catch (e) {
      query.page = null;
    }
  }
  if (q.tab) {
    try {
      query.tab = JSON.parse(q.tab);
    } catch (e) {
      query.tab = null;
    }
  }
  if (q.type) {
    try {
      query.type = JSON.parse(q.type);
    } catch (e) {
      query.type = null;
    }
  }
  if (q.keywords) {
    query.keywords = q.keywords;
  }
  if (q.date) {
    query.date = q.date;
  }
  if (q.timestamp) {
    query.timestamp = q.timestamp;
  }
  return query;
};

const selects = '_id title desc date timestamp keywords page tab type cover content toTop showAuthorInfo author comments';

const getArticle = async (ctx, next) => {
  const id = ctx.query.id;
  if (id) {
    try {
      const result = await findById(id)
        .populate('author', 'name company position')
        .populate('comments.user', 'name')
        .select(selects)
        .lean()
        .exec();
      const url = `${config.hostname}/wzxq?id=${result._id}`;
      result.url = url;
      ctx.body = result;
    } catch (e) {
      throw new ApiError(ApiErrorNames.ARTICLE_NOT_EXIST);
    }
  } else {
    let pageSize = ctx.query.pageSize, offset = ctx.query.offset; //支持分页
    let result = [];
    pageSize = pageSize === undefined ? 100 : parseInt(pageSize);
    offset = offset === undefined ? 0 : parseInt(offset);

    let ids;
    try {
      ids = parse(ctx.query.ids);
    } catch (e) {
      ids = null;
    }
    if (ids && ids.length > 0) {
      try {
        let count = await findByIds(ids).count();
        result = await findByIds(ids)
          .sort({ _id: -1 })
          .skip(offset)
          .limit(pageSize)
          .select(selects)
          .lean()
          .exec();
        result.forEach(item => {
          const url = `${config.hostname}/wzxq?id=${item._id}`;
          item.keywords = item.keywords.join('、');
          item.url = url;
        });
        ctx.body = {
          total: count,
          data: result
        };
      } catch (e) {
        throw new ApiError(ApiErrorNames.UNKNOW_ERROR);
      }
    } else {
      let query = getCommonQueries(ctx.query);
      try {
        let count = await find(Object.assign({}, query)).count();
        result = await find(Object.assign({}, query))
          .populate('author', 'name')
          .sort({ _id: -1 })
          .skip(offset)
          .limit(pageSize)
          .select(selects)
          .lean()
          .exec();
        result.forEach(item => {
          const url = `${config.hostname}/wzxq?id=${item._id}`;
          item.keywords = item.keywords.join('、');
          item.url = url;
        });
        ctx.body = {
          total: count,
          data: result
        };
      } catch (e) {
        throw new ApiError(ApiErrorNames.UNKNOW_ERROR);
      }
    }
  }
};

const getArticleFeeds = async (ctx, next) => {
  let result = [], count = 0;
  let pageSize = ctx.query.pageSize, offset = ctx.query.offset; //支持分页
  pageSize = pageSize === undefined ? 100 : parseInt(pageSize);
  offset = offset === undefined ? 0 : parseInt(offset);

  let ids;
  try {
    ids = JSON.parse(ctx.query.ids);
  } catch (e) {
    ids = null;
  }
  if (ids && ids.length > 0) {
    try {
      count = await findByIds(ids).count();
      result = await findByIds(ids)
        .sort({ _id: -1 })
        .skip(offset)
        .limit(pageSize)
        .select('_id title desc date cover toTop')
        .lean()
        .exec();
      result.forEach(item => {
        const url = `${config.hostname}/wzxq?id=${item._id}`;
        item.url = url;
      });
      ctx.body = {
        total: count,
        data: result
      };
    } catch (e) {
      throw new ApiError(ApiErrorNames.UNKNOW_ERROR);
    }
  } else {
    const query = getCommonQueries(ctx.query);
    if (ctx.query.isMy) {
      query.author = ctx.session.userId;
    }
    try {
      count = await find(Object.assign({}, query)).count();
      let topArticle = await find(Object.assign({}, query, { toTop: true }));
      if (offset === 0 && topArticle.length > 0) {
        pageSize -= 1;
      }
      result = await find(Object.assign({}, query))
        .sort({ _id: -1 })
        .skip(offset)
        .limit(pageSize)
        .select('_id title desc date cover toTop')
        .lean()
        .exec();
      result.forEach((item, idx) => {
        const url = `${config.hostname}/wzxq?id=${item._id}`;
        if (topArticle[0] && item._id + '' === topArticle[0]._id + '') {
          result.splice(idx, 1);
        } else {
          item.url = url;
        }
      });

      if (topArticle[0]) {
        topArticle[0].url = `${config.hostname}/wzxq?id=${topArticle[0]._id}`;
        result.unshift(topArticle[0]);
      }

      ctx.body = {
        total: count,
        data: result
      };
    } catch (e) {
      throw new ApiError(ApiErrorNames.UNKNOW_ERROR);
    }
  }
};

const updateArticle = async (ctx, next) => {
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
        ctx.body = result;
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

const getTimeStr = () => {
  let date = new Date();
  let year = date.getFullYear(),
    month = date.getMonth() + 1,
    day = date.getDate(),
    hour = date.getHours(),
    min = date.getMinutes();
  month = month < 10 ? `0${month}` : month;
  day = day < 10 ? `0${day}` : day;
  hour = hour < 10 ? `0${hour}` : hour;
  min = min < 10 ? `0${min}` : min;
  return `${year}-${month}-${day} ${hour}:${min}`;
};

const commentArticle = async (ctx, next) => {
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
      let content = param.content;
      if (content) {
        try {
          let comment = {
            user: ctx.session.userId,
            content: content,
            time: getTimeStr()
          };
          const article = await findById(id).select('comments').lean().exec();
          let comments = article.comments || [];
          comments.unshift(comment);
          const result = await update(id, { comments });
          ctx.body = result;
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

const toTopArticle = async (ctx, next) => {
  let param;
  if (ctx.method === 'GET') {
    param = ctx.request.query;
  } else {
    param = ctx.request.body;
  }
  const id = param.id;
  if (id) {
    let page = param.page || {};
    let tab = param.tab || {};
    if (typeof page === 'string') {
      try {
        page = JSON.parse(page);
      } catch (e) {
        page = {};
      }
    }
    if (typeof tab === 'string') {
      try {
        tab = JSON.parse(tab);
      } catch (e) {
        tab = {};
      }
    }
    if (page) {
      try {
        let currentTopArticle = await find({
          page: page,
          tab: tab,
          toTop: true
        });
        if (currentTopArticle[0]) {
          await update(currentTopArticle[0]._id, { toTop: false });
        }
        const result = await update(id, { toTop: true });
        ctx.body = result;
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

const createArticle = async (ctx, next) => {
  let data;
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
      data.author = ctx.session.userId;
      const result = await create(data);
      ctx.body = result;
    } catch (e) {
      throw new ApiError(ApiErrorNames.UNKNOW_ERROR);
    }
  } else {
    throw new ApiError(ApiErrorNames.PARAM_ILLEGAL);
  }
};

const removeArticle = async (ctx, next) => {
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
  toTopArticle,
  getArticle,
  getArticleFeeds,
  updateArticle,
  createArticle,
  removeArticle,
  commentArticle
};
