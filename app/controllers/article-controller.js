import {find, findById, update, remove, create}  from '../models/article-model'
const config = require('../../config/index')
const ApiError = require('../error/api-error');
const ApiErrorNames = require('../error/api-error-names');

const getCommonQueries = (q)=> {
    let query = {}
    // 支持以下查询条件
    if(q.title) {
        query.title = q.title
    }
    if(q.page) {
        try {
            query.page = JSON.parse(q.page)
        } catch(e) {
            query.page = null
        }
    }
    if(q.tab) {
        try {
            query.tab = JSON.parse(q.tab)
        } catch(e) {
            query.tab = null
        }
    }
    if(q.type) {
        try {
            query.type = JSON.parse(q.type)
        } catch(e) {
            query.type = null
        }
    }
    if(q.keywords) {
        query.keywords = q.keywords
    }
    if(q.date) {
        query.date = q.date
    }
    if(q.timestamp) {
        query.timestamp = q.timestamp
    }
    return query
}

const selects = '_id title desc date timestamp keywords page tab type cover content'

const getArticle = async(ctx, next)=> {
    const id = ctx.query.id;
    if(id) {
        try{
            const result = await findById(id).select(selects).lean().exec()
            const url = `http://${config.hostname}/wzxq?id=${result._id}`
            result.url = url
            ctx.body = result
        } catch(e) {
            throw new ApiError(ApiErrorNames.ARTICLE_NOT_EXIST);
        }
    } else {
        const query = getCommonQueries(ctx.query)
        let pageSize = ctx.query.pageSize, offset = ctx.query.offset; //支持分页
        let result = []
        pageSize = pageSize === undefined ? 100 : parseInt(pageSize)
        offset = offset === undefined ? 0 : parseInt(offset)

        try {
            let count = await find(Object.assign({}, query)).count()
            result = await find(Object.assign({}, query)).sort({_id: -1}).skip(offset).limit(pageSize).select(selects).lean().exec()
            result.forEach((item)=> {
                const url = `http://${config.hostname}/wzxq?id=${item._id}`
                item.keywords = item.keywords.join('、')
                item.url = url
            })
            ctx.body = {
                total: count,
                data: result
            }
        } catch(e) {
            throw new ApiError(ApiErrorNames.UNKNOW_ERROR)
        }
    }
}

const getArticleFeeds = async(ctx, next)=> {
    const query = getCommonQueries(ctx.query)
    let pageSize = ctx.query.pageSize, offset = ctx.query.offset; //支持分页
    pageSize = pageSize === undefined ? 100 : parseInt(pageSize)
    offset = offset === undefined ? 0 : parseInt(offset)

    try {
        let count = await find(Object.assign({}, query)).count()
        let result = []
        result = await find(Object.assign({}, query)).sort({_id: -1}).skip(offset).limit(pageSize).select("_id title desc date cover").lean().exec()
        result.forEach((item)=> {
            const url = `/wzxq?id=${item._id}`
            item.url = url
        })
        ctx.body = {
            total: count,
            data: result
        }
    } catch(e) {
        throw new ApiError(ApiErrorNames.UNKNOW_ERROR)
    }
}

const updateArticle = async(ctx, next)=> {
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

const createArticle = async(ctx, next)=> {
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

const removeArticle = async(ctx, next)=> {
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

module.exports = {getArticle, getArticleFeeds, updateArticle, createArticle, removeArticle}

