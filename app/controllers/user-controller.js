import {findAll, find, findById, findByAccount, update, remove, create}  from '../models/user-model'
import md5 from 'md5'
import {validateCaptcha} from './message-controller'
const ApiError = require('../error/api-error');
const ApiErrorNames = require('../error/api-error-names');

const encode = (str)=> {
    if(!str || str.length <= 8) {
        return str;
    }
    return str.replace(/(\d{4})(\d+)(\d{4})/, (a, b, c, d)=> {
        let x = '', i=0;
        while(i++<c.length) {
           x += '*'
        }
        return b + x + d;
    })
}
const getUser = async(ctx, next)=> {
    const userId = ctx.session.userId
    if(!userId) {
        throw new ApiError(ApiErrorNames.USER_NOT_LOGIN)
    }
    console.log('getUser userId', userId)
    try {
        let result = await findById(userId).lean().exec()
        console.log('findById result', result)
        if(!result) {
            throw new ApiError(ApiErrorNames.USER_NOT_EXIST)
        }
        result.idNumber = encode(result.idNumber)
        ctx.body = result
    } catch(e) {
        throw new ApiError(ApiErrorNames.UNKNOW_ERROR)
    }
}

const getCommonQueries = (q)=> {
    let query = {}
    if(q.name) {
        query.name = q.name
    }
    if(q.spell) {
        query.spell = q.spell
    }
    if(q.age) {
        query.age = q.age
    }
    if(q.gender) {
        query.gender = q.gender
    }
    if(q.realnameStatus) {
        query.realnameStatus = q.realnameStatus
    }
    return query
}

const getUsers = async(ctx, next)=> {
    const query = getCommonQueries(ctx.query)
    try {
        const result = await find(query).lean().exec()
        ctx.body = {data: result}
    } catch(e) {
        throw new ApiError(ApiErrorNames.UNKNOW_ERROR)
    }
}


const updateUser = async(ctx, next)=> {
    const userId = ctx.session.userId
    if(!userId) {
        throw new ApiError(ApiErrorNames.USER_NOT_LOGIN)
    }
    let data;
    if(ctx.method === 'GET') {
        data = ctx.request.query
    } else {
        data = ctx.request.body
    }
    try {
        const {name, gender, age, address} = data
        const result = await update(userId, {name, gender, age, address})
        ctx.body = result
    } catch(e) {
        throw new ApiError(ApiErrorNames.UNKNOW_ERROR)
    }
}

const identifyUser = async(ctx, next)=> {
    const userId = ctx.session.userId
    if(!userId) {
        throw new ApiError(ApiErrorNames.USER_NOT_LOGIN)
    }
    let data;
    if(ctx.method === 'GET') {
        data = ctx.request.query
    } else {
        data = ctx.request.body
    }

    const {name, gender, age, phone, idNumber, address, code} = data
    const realnameStatus = 1, realnameResult = '审核中'
    const ret = validateCaptcha(phone, code)
    if(!ret.valid) {
        ctx.body = ret
    } else {
        try {
            const result = await update(userId, {name, gender, age, address, idNumber, realnameStatus, realnameResult})
            ctx.body = result
        } catch(e) {
            throw new ApiError(ApiErrorNames.UNKNOW_ERROR)
        }
    }
}

const passIdentify = async(ctx, next)=> {
    let userId
    if(ctx.method === 'GET') {
        userId = ctx.request.query.userId
    } else {
        userId = ctx.request.body.userId
    }
    if(userId) {
        try {
            const result = await update(userId, {realnameStatus: 2})
            ctx.body = result;
        } catch(e) {
            throw new ApiError(ApiErrorNames.UNKNOW_ERROR)
        }
    } else {
        throw new ApiError(ApiErrorNames.PARAM_ILLEGAL)
    }
}

const rejectIdentify = async(ctx, next)=> {
    let userId, reason
    if(ctx.method === 'GET') {
        userId = ctx.request.query.userId
        reason = ctx.request.query.reason
    } else {
        userId = ctx.request.body.userId
        reason = ctx.request.body.reason
    }
    if(!userId || !reason) {
        throw new ApiError(ApiErrorNames.PARAM_ILLEGAL)
    } else {
        try {
            const result = await update(userId, {realnameStatus: 3, realnameResult: reason})
            ctx.body = result;
        } catch(e) {
            throw new ApiError(ApiErrorNames.UNKNOW_ERROR)
        }
    }
}

const registerUser = async(ctx, next)=> {
    let phone, captcha, password
    if(ctx.method === 'GET') {
        phone = ctx.request.query.phone
        captcha = ctx.request.query.code
        password = ctx.request.query.password
    } else {
        phone = ctx.request.body.phone
        captcha = ctx.request.body.code
        password = ctx.request.body.password
    }
    const ret = validateCaptcha(phone, captcha)
    if(!ret.valid) {
        ctx.body = ret
    } else {
        try {
            const result = await create({phone: phone, account: phone, password: md5(password), isGovernor: false, realnameStatus: 0, realnameResult: ''})
            ctx.body = result
        } catch(e) {
            throw new ApiError(ApiErrorNames.UNKNOW_ERROR)
        }
    }
}

const isUserExist = (account)=> {
    return new Promise((resolve, reject)=> {
        findByAccount(account).exec((err, user)=> {
            if(err) {
                reject(false)
            } else {
                if(user) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            }
        })
    })
}

const isRealname = (userId)=> {
    return new Promise((resolve, reject)=> {
        if(!userId) {
            reject(false)
        }
        findById(userId).exec((err, user)=> {
            if(err) {
                reject(false)
            } else {
                if(user && user.realnameStatus === 2) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            }
        })
    })
}

const userLogin = async(ctx, next)=> {
    let account, password;
    if(ctx.method === 'GET') {
        account = ctx.request.query.account
        password = ctx.request.query.password
    } else {
        account = ctx.request.body.account
        password = ctx.request.body.password
    }
    if(!account || !password) {
        throw new ApiError(ApiErrorNames.PARAM_ILLEGAL)
    } else {
        let user;
        try {
            user = await findByAccount(account).lean().exec()
        } catch(e) {
            throw new ApiError(ApiErrorNames.USER_NOT_EXIST)
        }
        if(!user) {
            throw new ApiError(ApiErrorNames.USER_NOT_EXIST)
        } else {
            if(md5(password) === user.password) {
                ctx.session.userId = user._id
                ctx.body = {}
            } else {
                throw new ApiError(ApiErrorNames.PASSWORD_INCORRECT)
            }
        }
    }
}

module.exports = {registerUser, identifyUser, isUserExist, isRealname, userLogin, getUser, getUsers, updateUser, passIdentify, rejectIdentify}