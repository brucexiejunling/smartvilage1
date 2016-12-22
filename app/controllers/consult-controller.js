import {find, update, remove, create}  from '../models/consult-model'
const ApiError = require('../error/api-error');
const ApiErrorNames = require('../error/api-error-names');
const userController = require('./user-controller')
const userModel = require('../models/user-model')

const selects = ''

const getConsults = async(ctx, next)=> {
    let query = Object.assign({}, ctx.query)
    let pageSize = query.pageSize, offset = query.offset; //支持分页
    pageSize = pageSize === undefined ? 50 : parseInt(pageSize)
    offset = offset === undefined ? 0 : parseInt(offset)

    delete query.offset
    delete query.pageSize
    delete query.callback
    let count = await find(query).count()
    let result = []
    try {
        result = await find(query).populate('user', 'name age gender phone idNumber address')
            .populate('department', 'name').sort({_id: -1}).skip(offset).limit(pageSize).lean().exec()
        ctx.body = {
            total: count,
            data: result
        }
    } catch(e) {
       throw new ApiError(ApiErrorNames.UNKNOW_ERROR)
    }
}

const updateConsult = async(ctx, next)=> {
    let param;
    if(ctx.method === 'GET') {
        param = ctx.request.query
    } else {
        param = ctx.request.body
    }
    const id = param.id
    if(id) {
        let data = param.data
        if(typeof data === 'string') {
            try {
                data = JSON.parse(data)
            } catch(e) {
                data = null;
            }
        }
        if(data) {
            try {
                const result = await update(id, data)
                ctx.body = {
                    data: result
                }
            } catch(e) {
                throw new ApiError(ApiErrorNames.UNKNOW_ERROR)
            }
        } else {
            throw new ApiError(ApiErrorNames.PARAM_ILLEGAL)
        }
    } else {
        throw new ApiError(ApiErrorNames.PARAM_ILLEGAL)
    }
}

const createConsult = async(ctx, next)=> {
    let data;
    if(!ctx.session.userId) {
        throw new ApiError(ApiErrorNames.USER_NOT_LOGIN)
    }  else {
        const isRealname = await userController.isRealname(ctx.session.userId)
        if(!isRealname) {
            throw new ApiError(ApiErrorNames.USER_NOT_REALNAME)
        }
        if(ctx.method === 'GET') {
            data = ctx.request.query.data
        } else {
            data = ctx.request.body.data
        }
        if(typeof data === 'string') {
            try {
                data = JSON.parse(data)
            } catch(e) {
                data = null;
            }
        }
        if(data) {
            try {
                data.userId = ctx.session.userId
                const result = await create(data)
                ctx.body = result
            } catch(e) {
                throw new ApiError(ApiErrorNames.UNKNOW_ERROR)
            }
        } else {
            throw new ApiError(ApiErrorNames.PARAM_ILLEGAL)
        }
    }
}

const removeConsult = async(ctx, next)=> {
    let param;
    if(ctx.method === 'GET') {
        param = ctx.request.query
    } else {
        param = ctx.request.body
    }
    const id = param.id
    if(id) {
        try {
            const result = await remove(id)
            ctx.body = result
        } catch(e) {
            throw new ApiError(ApiErrorNames.UNKNOW_ERROR)
        }
    } else {
        throw new ApiError(ApiErrorNames.PARAM_ILLEGAL)
    }
}

module.exports = {getConsults, updateConsult, createConsult, removeConsult}

