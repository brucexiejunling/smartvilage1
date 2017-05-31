import {
  find,
  findOne,
  findById,
  update,
  remove,
  create
} from '../models/record-model';
const config = require('../../config/index');
const ApiError = require('../error/api-error');
const ApiErrorNames = require('../error/api-error-names');
const userModel = require('../models/user-model');

const setRecord = async (ctx, next) => {
  let signinTime, signoutTime;
  // 测试
  // ctx.session.userId = '58529ae8ae6fd22d9d9cd824';

  if (!ctx.session.userId) {
    throw new ApiError(ApiErrorNames.USER_NOT_LOGIN);
  } else {
    if (ctx.method === 'GET') {
      signinTime = ctx.request.query.signinTime;
      signoutTime = ctx.request.query.signoutTime;
    } else {
      signinTime = ctx.request.body.signinTime;
      signoutTime = ctx.request.body.signoutTime;
    }
    if (signinTime && signoutTime) {
      try {
        let result = await findOne({ isSystem: true }).lean().exec();
        if (!result) {
          result = await create({
            isSystem: true,
            signinTime: signinTime,
            signoutTime: signoutTime
          });
        } else {
          result = await update(result._id, { signinTime, signoutTime });
        }
        ctx.body = result;
      } catch (e) {
        throw new ApiError(ApiErrorNames.UNKNOW_ERROR);
      }
    } else {
      throw new ApiError(ApiErrorNames.PARAM_ILLEGAL);
    }
  }
};

const getRecordDetail = async (ctx, next) => {
  // 测试
  // ctx.session.userId = '5900b2cbdc3bfb20933191c7';

  if (!ctx.session.userId) {
    throw new ApiError(ApiErrorNames.USER_NOT_LOGIN);
  } else {
    const id = ctx.request.query.id;
    const type = ctx.request.query.type;
    if (id) {
      let record = await findById(id).lean().exec();
      let signiners = record.signiners;
      let signouters = record.signouters;
      if (type === 'department') {
        let currentUser = await userModel
          .findById(ctx.session.userId)
          .populate('department', 'name')
          .lean()
          .exec();
        let allDepMembers = await userModel
          .find({ department: currentUser.department._id })
          .select('name')
          .lean()
          .exec();
        allDepMembers.forEach(member => {
          let signinObj = signiners.filter(signer => {
            return member._id + '' === signer.user + '';
          })[0];
          if (signinObj) {
            member.signinTime = signinObj.time;
            member.signinLocation = signinObj.location;
          }
          let signoutObj = signouters.filter(signer => {
            return member._id + '' === signer.user + '';
          })[0];
          if (signoutObj) {
            member.signoutTime = signoutObj.time;
            member.signoutLocation = signoutObj.location;
          }
        });
        ctx.body = {
          date: record.date,
          signinTime: record.signinTime,
          signoutTime: record.signoutTime,
          department: currentUser.department.name,
          members: allDepMembers
        };
      } else if (type === 'all') {
        const department = ctx.request.query.department;
        let allMembers = [];
        if (department) {
          allMembers = await userModel
            .find({ department })
            .select('name')
            .lean()
            .exec();
        } else {
          allMembers = await userModel
            .find({})
            .where('level')
            .gte(3)
            .select('name')
            .lean()
            .exec();
        }
        allMembers.forEach(member => {
          let signinObj = signiners.filter(signer => {
            return member._id + '' === signer.user + '';
          })[0];
          if (signinObj) {
            member.signinTime = signinObj.time;
            member.signinLocation = signinObj.location;
          }
          let signoutObj = signouters.filter(signer => {
            return member._id + '' === signer.user + '';
          })[0];
          if (signoutObj) {
            member.signoutTime = signoutObj.time;
            member.signoutLocation = signoutObj.location;
          }
        });
        ctx.body = {
          date: record.date,
          signinTime: record.signinTime,
          signoutTime: record.signoutTime,
          members: allMembers
        };
      }
    } else {
      throw new ApiError(ApiErrorNames.PARAM_ILLEGAL);
    }
  }
};

let recordMap = {};
const getRecord = async (ctx, next) => {
  // 测试
  // ctx.session.userId = '58529ae8ae6fd22d9d9cd824';

  if (!ctx.session.userId) {
    throw new ApiError(ApiErrorNames.USER_NOT_LOGIN);
  } else {
    const id = ctx.request.query.id;
    const date = ctx.request.query.date;
    let query;
    if (id) {
      query = { _id: id };
    } else if (date) {
      query = { date };
    }
    if (query) {
      let system = await findOne({ isSystem: true }).lean().exec();
      if (!system) {
        throw new ApiError(ApiErrorNames.RECORD_UNSET);
      } else {
        query.isSystem = false;
        let result = await findOne(query);
        if (!result && !recordMap[date]) {
          recordMap = {};
          recordMap[date] = true;
          result = await create({
            signinTime: system.signinTime,
            signoutTime: system.signoutTime,
            isSystem: false,
            date: date
          });
        }
        ctx.body = result || {
          signinTime: system.signinTime,
          date: date,
          signoutTime: system.signoutTime,
          isSystem: false
        };
      }
    } else {
      throw new ApiError(ApiErrorNames.PARAM_ILLEGAL);
    }
  }
};

const getRecords = async (ctx, next) => {
  // 测试
  // ctx.session.userId = '5900b2cbdc3bfb20933191c7';

  let query = Object.assign({}, ctx.query);
  let type = query.type || 'all';
  let pageSize = query.pageSize, offset = query.offset; //支持分页
  pageSize = pageSize === undefined ? 30 : parseInt(pageSize);
  offset = offset === undefined ? 0 : parseInt(offset);

  delete query.type;
  delete query.offset;
  delete query.pageSize;
  delete query.callback;

  const currentUser = await userModel.findById(ctx.session.userId);

  if (type === 'all') {
    //镇长书记
    if (currentUser.level >= 5) {
      const totalMembers = await userModel
        .find({})
        .where('level')
        .gte(3)
        .count();
      const count = (await find(query).count()) - 1; //减去默认的那条
      let result = [];
      try {
        result = await find(query)
          .populate('signiners.user', 'name')
          .populate('signouters.user', 'name')
          .select('isSystem date signinTime signoutTime signiners signouters')
          .skip(offset)
          .limit(pageSize);
        let list = [];
        result.forEach(item => {
          if (!item.isSystem) {
            //倒序
            list.push({
              url: `/qdxq?id=${item._id}&type=all`,
              date: item.date,
              signinTime: item.signinTime,
              signoutTime: item.signoutTime,
              signinCount: item.signiners.length,
              unsigninCount: totalMembers - item.signiners.length,
              signoutCount: item.signouters.length,
              unsignoutCount: totalMembers - item.signouters.length,
              totalMembers: totalMembers
            });
          }
        });
        ctx.body = {
          data: list,
          total: count
        };
      } catch (e) {
        throw new ApiError(ApiErrorNames.UNKNOW_ERROR);
      }
    } else {
      throw new ApiError(ApiErrorNames.ACCESS_DENIED);
    }
  } else if (type === 'department') {
    //部门负责人才可以看
    if (currentUser.level === 4) {
      const totalMembers = await userModel
        .find({ department: currentUser.department })
        .count();
      const count = (await find(query).count()) - 1;
      let result = [];
      try {
        result = await find(query)
          .populate('signiners.user', 'name department')
          .populate('signouters.user', 'name department')
          .select('isSystem date signinTime signoutTime signiners signouters')
          .skip(offset)
          .limit(pageSize);
        let list = [];
        result.forEach(item => {
          if (!item.isSystem) {
            let signiners = item.signiners || [],
              signouters = item.signouters || [];
            let signinCount = 0, signoutCount = 0;
            signinCount = signiners.filter(signer => {
              return signer.user.department + '' ===
                currentUser.department + '';
            }).length;
            signoutCount = signouters.filter(signer => {
              return signer.user.department + '' ===
                currentUser.department + '';
            }).length;

            list.push({
              url: `/qdxq?id=${item._id}&type=department`,
              date: item.date,
              signinTime: item.signinTime,
              signoutTime: item.signoutTime,
              signinCount: signinCount,
              unsigninCount: totalMembers - signinCount,
              signoutCount: signoutCount,
              unsignoutCount: totalMembers - signoutCount,
              totalMembers: totalMembers
            });
          }
        });
        ctx.body = {
          data: list,
          total: count
        };
      } catch (e) {
        throw new ApiError(ApiErrorNames.UNKNOW_ERROR);
      }
    } else {
      throw new ApiError(ApiErrorNames.ACCESS_DENIED);
    }
  }
};

const getTimeStr = () => {
  let date = new Date();
  let hour = date.getHours(), min = date.getMinutes(), sec = date.getSeconds();
  hour = hour < 10 ? `0${hour}` : hour;
  min = min < 10 ? `0${min}` : min;
  sec = sec < 10 ? `0${sec}` : sec;
  return `${hour}:${min}:${sec}`;
};

const signin = async (ctx, next) => {
  // 测试
  // ctx.session.userId = '592306222ec3727cb2607351';

  if (!ctx.session.userId) {
    throw new ApiError(ApiErrorNames.USER_NOT_LOGIN);
  } else {
    let pos, date;
    if (ctx.method === 'GET') {
      pos = ctx.request.query.position;
      date = ctx.request.query.date;
    } else {
      pos = ctx.request.body.position;
      date = ctx.request.body.date;
    }
    if (pos && date) {
      let today = await findOne({ date: date, isSystem: false }).lean().exec();
      if (!today) {
        throw new ApiError(ApiErrorNames.RECORD_UNSET);
      } else {
        let signiners = today.signiners || [];
        let hasSign = signiners.some((item, idx) => {
          return item.user + '' === ctx.session.userId | '';
        });
        if (hasSign) {
          throw new ApiError(ApiErrorNames.SIGNIN_ALREADY);
        } else {
          let sign = {
            user: ctx.session.userId,
            location: pos,
            time: getTimeStr()
          };
          signiners.push(sign);
          const result = await update(today._id, { signiners });
          ctx.body = { signinTime: sign.time };
        }
      }
    } else {
      throw new ApiError(ApiErrorNames.PARAM_ILLEGAL);
    }
  }
};

const signout = async (ctx, next) => {
  // 测试
  // ctx.session.userId = '5900b2cbdc3bfb20933191c7';

  if (!ctx.session.userId) {
    throw new ApiError(ApiErrorNames.USER_NOT_LOGIN);
  } else {
    let pos, date;
    if (ctx.method === 'GET') {
      pos = ctx.request.query.position;
      date = ctx.request.query.date;
    } else {
      pos = ctx.request.body.position;
      date = ctx.request.body.date;
    }
    if (pos && date) {
      let today = await findOne({ date: date, isSystem: false }).lean().exec();
      if (!today) {
        throw new ApiError(ApiErrorNames.RECORD_UNSET);
      } else {
        let signouters = today.signouters || [];
        let hasSign = signouters.some((item, idx) => {
          return item.user + '' === ctx.session.userId + '';
        });
        if (hasSign) {
          throw new ApiError(ApiErrorNames.SIGNOUT_ALREADY);
        } else {
          let sign = {
            user: ctx.session.userId,
            location: pos,
            time: getTimeStr()
          };
          signouters.push(sign);
          const result = await update(today._id, { signouters });
          ctx.body = { signoutTime: sign.time };
        }
      }
    } else {
      throw new ApiError(ApiErrorNames.PARAM_ILLEGAL);
    }
  }
};

module.exports = {
  setRecord,
  getRecord,
  getRecordDetail,
  getRecords,
  signin,
  signout
};
