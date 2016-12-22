import {findAll, update, remove, create}  from '../models/department-model'
const ApiError = require('../error/api-error');
const ApiErrorNames = require('../error/api-error-names');

const selects = '_id name desc office incharges'

const getAllDepartments = async(ctx, next)=> {
    try {
        const result = await findAll().select(selects).lean().exec()
        ctx.body = {
            data: result
        }
    } catch(e) {
        throw new ApiError(ApiErrorNames.UNKNOW_ERROR)
    }
}

const updateDepartment = async(ctx, next)=> {
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

const createDepartment = async(ctx, next)=> {
    let data;
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
            const result = await create(data)
            ctx.body = result
        } catch(e) {
            throw new ApiError(ApiErrorNames.UNKNOW_ERROR)
        }
    } else {
        throw new ApiError(ApiErrorNames.PARAM_ILLEGAL)
    }
}

const removeDepartment = async(ctx, next)=> {
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
        }catch(e) {
            throw new ApiError(ApiErrorNames.UNKNOW_ERROR)
        }
    } else {
        throw new ApiError(ApiErrorNames.PARAM_ILLEGAL)
    }
}

module.exports = {getAllDepartments, updateDepartment, createDepartment, removeDepartment}

