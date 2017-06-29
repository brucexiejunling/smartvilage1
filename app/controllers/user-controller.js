import {
  findAll,
  find,
  findById,
  findByAccount,
  update,
  remove,
  create
} from '../models/user-model';
import md5 from 'md5';
import { validateCaptcha } from './message-controller';
const ApiError = require('../error/api-error');
const ApiErrorNames = require('../error/api-error-names');

const encode = str => {
  if (!str || str.length <= 8) {
    return str;
  }
  return str.replace(/(\d{4})(\d+)(\d{4})/, (a, b, c, d) => {
    let x = '', i = 0;
    while (i++ < c.length) {
      x += '*';
    }
    return b + x + d;
  });
};
const getUser = async (ctx, next) => {
  //测试 
  ctx.session.userId = '5900b2cbdc3bfb20933191c7';
  // ctx.session.userId = '592306822ec3727cb2607352'; //孟小姐

  const userId = ctx.session.userId;
  if (!userId) {
    throw new ApiError(ApiErrorNames.USER_NOT_LOGIN);
  }
  try {
    let result = await findById(userId).lean().exec();
    if (!result) {
      throw new ApiError(ApiErrorNames.USER_NOT_EXIST);
    }
    result.idNumber = encode(result.idNumber);
    ctx.body = result;
  } catch (e) {
    throw new ApiError(ApiErrorNames.UNKNOW_ERROR);
  }
};

const getCommonQueries = q => {
  let query = {};
  if (q.name) {
    query.name = q.name;
  }
  if (q.spell) {
    query.spell = q.spell;
  }
  if (q.age) {
    query.age = q.age;
  }
  if (q.gender) {
    query.gender = q.gender;
  }
  if (q.realnameStatus) {
    query.realnameStatus = q.realnameStatus;
  }
  if (q.level) {
    query.level = q.level;
  }
  if (q.department) {
    query.department = q.department;
  }
  return query;
};

const getUsers = async (ctx, next) => {
  const query = getCommonQueries(ctx.query);
  try {
    let result = [];
    let pageSize = ctx.query.pageSize, offset = ctx.query.offset; //支持分页
    pageSize = pageSize === undefined ? 100 : parseInt(pageSize);
    offset = offset === undefined ? 0 : parseInt(offset);
    if (ctx.query.levelGt) {
      result = await find(query)
        .where('level')
        .gte(parseInt(ctx.query.levelGt))
        .skip(offset)
        .limit(pageSize)
        .populate('department', 'name')
        .lean()
        .exec();
    } else {
      result = await find(query)
        .skip(offset)
        .limit(pageSize)
        .populate('department', 'name')
        .lean()
        .exec();
    }
    ctx.body = { data: result };
  } catch (e) {
    throw new ApiError(ApiErrorNames.UNKNOW_ERROR);
  }
};

const updateUser = async (ctx, next) => {
  const userId = ctx.session.userId;
  if (!userId) {
    throw new ApiError(ApiErrorNames.USER_NOT_LOGIN);
  }
  let data;
  if (ctx.method === 'GET') {
    data = ctx.request.query;
  } else {
    data = ctx.request.body;
  }
  try {
    const result = await update(userId, data);
    ctx.body = result;
  } catch (e) {
    throw new ApiError(ApiErrorNames.UNKNOW_ERROR);
  }
};

const modifyUser = async (ctx, next) => {
  let data;
  if (ctx.method === 'GET') {
    data = ctx.request.query;
  } else {
    data = ctx.request.body;
  }
  if(data.password) {
    data.password = md5(data.password);
  }
  try {
    const userId = data._id;
    delete data._id;
    const result = await update(userId, data);
    ctx.body = result;
  } catch (e) {
    throw new ApiError(ApiErrorNames.UNKNOW_ERROR);
  }
};

const removeUser = async (ctx, next) => {
  let data;
  if (ctx.method === 'GET') {
    data = ctx.request.query;
  } else {
    data = ctx.request.body;
  }
  try {
    const userId = data.id;
    const result = await remove(userId);
    ctx.body = result;
  } catch (e) {
    throw new ApiError(ApiErrorNames.UNKNOW_ERROR);
  }
};

const identifyUser = async (ctx, next) => {
  const userId = ctx.session.userId;
  if (!userId) {
    throw new ApiError(ApiErrorNames.USER_NOT_LOGIN);
  }
  let data;
  if (ctx.method === 'GET') {
    data = ctx.request.query;
  } else {
    data = ctx.request.body;
  }

  const { name, gender, age, phone, idNumber, address, code } = data;
  const realnameStatus = 1, realnameResult = '审核中';
  const ret = validateCaptcha(phone, code);
  if (!ret.valid) {
    ctx.body = ret;
  } else {
    try {
      const result = await update(userId, {
        name,
        gender,
        age,
        address,
        idNumber,
        realnameStatus,
        realnameResult
      });
      ctx.body = result;
    } catch (e) {
      throw new ApiError(ApiErrorNames.UNKNOW_ERROR);
    }
  }
};

const passIdentify = async (ctx, next) => {
  let userId;
  if (ctx.method === 'GET') {
    userId = ctx.request.query.userId;
  } else {
    userId = ctx.request.body.userId;
  }
  if (userId) {
    try {
      const result = await update(userId, { realnameStatus: 2 });
      ctx.body = result;
    } catch (e) {
      throw new ApiError(ApiErrorNames.UNKNOW_ERROR);
    }
  } else {
    throw new ApiError(ApiErrorNames.PARAM_ILLEGAL);
  }
};

const rejectIdentify = async (ctx, next) => {
  let userId, reason;
  if (ctx.method === 'GET') {
    userId = ctx.request.query.userId;
    reason = ctx.request.query.reason;
  } else {
    userId = ctx.request.body.userId;
    reason = ctx.request.body.reason;
  }
  if (!userId || !reason) {
    throw new ApiError(ApiErrorNames.PARAM_ILLEGAL);
  } else {
    try {
      const result = await update(userId, {
        realnameStatus: 3,
        realnameResult: reason
      });
      ctx.body = result;
    } catch (e) {
      throw new ApiError(ApiErrorNames.UNKNOW_ERROR);
    }
  }
};

const registerUser = async (ctx, next) => {
  let phone, captcha, password;
  if (ctx.method === 'GET') {
    phone = ctx.request.query.phone;
    captcha = ctx.request.query.code;
    password = ctx.request.query.password;
  } else {
    phone = ctx.request.body.phone;
    captcha = ctx.request.body.code;
    password = ctx.request.body.password;
  }
  const ret = validateCaptcha(phone, captcha);
  if (!ret.valid) {
    ctx.body = ret;
  } else {
    try {
      const result = await create({
        phone: phone,
        account: phone,
        password: md5(password),
        level: 1,
        realnameStatus: 0,
        realnameResult: ''
      });
      ctx.body = result;
    } catch (e) {
      throw new ApiError(ApiErrorNames.UNKNOW_ERROR);
    }
  }
};

// const getDepartmentMembersCount = department => {
//   return new Promise((resolve, reject) => {
//     find({department}).count()(err, user) => {
//       if (err) {
//         reject(false);
//       } else {
//         if (user) {
//           resolve(true);
//         } else {
//           resolve(false);
//         }
//       }
//     });
//   });
// }

const isUserExist = account => {
  return new Promise((resolve, reject) => {
    findByAccount(account).exec((err, user) => {
      if (err) {
        reject(false);
      } else {
        if (user) {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    });
  });
};

const addUser = async (ctx, next) => {
  let data = {};
  if (ctx.method === 'GET') {
    data = ctx.request.query;
  } else {
    data = ctx.request.body;
  }
  let {
    name,
    gender,
    age,
    birthplace,
    company,
    phone,
    password,
    address,
    idNumber,
    level,
    position,
    realnameStatus,
    realnameResult,
    department
  } = data;
  const account = phone;
  password = md5(password);
  const isExist = await isUserExist(account);
  if (isExist) {
    throw new ApiError(ApiErrorNames.USER_ALREADY_EXIST);
  } else {
    try {
      const result = await create({
        name,
        gender,
        age,
        phone,
        address,
        birthplace,
        company,
        idNumber,
        level,
        position,
        realnameStatus,
        realnameResult,
        department,
        account,
        password
      });
      ctx.body = result;
    } catch (e) {
      throw new ApiError(ApiErrorNames.UNKNOW_ERROR);
    }
  }
};

const isRealname = userId => {
  return new Promise((resolve, reject) => {
    if (!userId) {
      reject(false);
    }
    findById(userId).exec((err, user) => {
      if (err) {
        reject(false);
      } else {
        if (user && user.realnameStatus === 2) {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    });
  });
};

const userLogin = async (ctx, next) => {
  let account, password;
  if (ctx.method === 'GET') {
    account = ctx.request.query.account;
    password = ctx.request.query.password;
  } else {
    account = ctx.request.body.account;
    password = ctx.request.body.password;
  }
  if (!account || !password) {
    throw new ApiError(ApiErrorNames.PARAM_ILLEGAL);
  } else {
    let user;
    try {
      user = await findByAccount(account).lean().exec();
    } catch (e) {
      throw new ApiError(ApiErrorNames.USER_NOT_EXIST);
    }
    if (!user) {
      throw new ApiError(ApiErrorNames.USER_NOT_EXIST);
    } else {
      if (md5(password) === user.password) {
        ctx.session.userId = user._id;
        ctx.body = {};
      } else {
        throw new ApiError(ApiErrorNames.PASSWORD_INCORRECT);
      }
    }
  }
};

module.exports = {
  addUser,
  registerUser,
  identifyUser,
  isUserExist,
  isRealname,
  userLogin,
  getUser,
  getUsers,
  updateUser,
  modifyUser,
  removeUser,
  passIdentify,
  rejectIdentify
};
