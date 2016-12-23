import {find, findAll, update, remove, create}  from '../models/page-model'
const ApiError = require('../error/api-error');
const ApiErrorNames = require('../error/api-error-names');

const getPage = async(ctx, next)=> {
    const name = ctx.query.name, _id = ctx.query.id;
    let query;
    if(_id) {
       query = {_id}
    } else if(name) {
        query = {name}
    }
    if(query) {
        try {
            const result = await find(query).lean().exec()
            if(!result) {
                throw new ApiError(ApiErrorNames.PAGE_NOT_EXIST)
            }
            ctx.body = result
        } catch(e) {
            throw new ApiError(ApiErrorNames.PAGE_NOT_EXIST)
        }
    } else {
        throw new ApiError(ApiErrorNames.PARAM_ILLEGAL)
    }
}

const getAllPage = async(ctx, next)=> {
    try {
        const result = await findAll().lean().exec();
        ctx.body = {
            data: result
        }
    } catch(e) {
        throw new ApiError(ApiErrorNames.UNKNOW_ERROR)
    }
}

const updatePage = async(ctx, next)=> {
    let param;
    if(ctx.method === 'GET') {
        param = ctx.request.query
    } else {
        param = ctx.request.body
    }
    const name = param.name, _id = param.id;
    let query;
    if(_id) {
        query = {_id}
    } else if(name) {
        query = {name}
    }
    console.log('query', query)
    if(query) {
        let data = param.data
        console.log('data', data, typeof data)
        if(typeof data === 'string') {
            try {
                data = JSON.parse(data)
            } catch(e) {
                data = null;
            }
        }
        console.log('daa---', data, typeof data)
        if(data) {
            try {
                const result = await update(query, data)
                ctx.body = result
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

const createPage = async(ctx, next)=> {
    const data = ctx.request.body
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

const removePage = async(ctx, next)=> {
    let param;
    if(ctx.method === 'GET') {
        param = ctx.request.query
    } else {
        param = ctx.request.body
    }
    const name = param.name, _id = param.id;
    let query;
    if(_id) {
        query = {_id}
    } else if(name) {
        query = {name}
    }
    if(query) {
        try {
            const result = await remove(query)
            ctx.body = result
        } catch(e) {
            throw new ApiError(ApiErrorNames.UNKNOW_ERROR)
        }
    } else {
        throw new ApiError(ApiErrorNames.PARAM_ILLEGAL)
    }
}

module.exports = {getPage, updatePage, createPage, removePage, getAllPage}

