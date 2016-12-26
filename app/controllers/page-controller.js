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
            if(name === 'kjzf') {
                let tabs = formatPaperTab(result.tabs)
                result.tabs = tabs;
            }
            ctx.body = result
        } catch(e) {
            throw new ApiError(ApiErrorNames.PAGE_NOT_EXIST)
        }
    } else {
        throw new ApiError(ApiErrorNames.PARAM_ILLEGAL)
    }
}

const formatPaperTab(tabs) {
    if(!tabs || tabs.length < 0) {return}
    tabs.forEach((item, idx)=> {
       if(item.name === 'paper') {
           let dateStr = formatDate(new Date())
           let paperUrl = 'http://www.cnepaper.com/gnrb/h5/html5/2016-11/30/node_1.htm'
           item.url = paperUrl.replace(/html5\/([^\/]+\/[^\/]+)\//g, (s, s1)=> {
                return `html5/${dateStr}/`
           })
           tabs[idx] = item
       }
    })
    return tabs;
}

const formatDate = (date)=> {
    let year = date.getFullYear(), month = date.getMonth() + 1, day = date.getDate();
    month = month < 10 ? `0${month}` : month;
    day = day < 10 ? `0${day}` : day;
    return `${year}-${month}/${day}`
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
    if(query) {
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

