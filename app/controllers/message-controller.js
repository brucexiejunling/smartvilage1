import {isUserExist} from './user-controller'
const config = require('../../config/index');
const TopClient = require('../sdk/alidayu/topClient').TopClient;
const ApiError = require('../error/api-error');
const ApiErrorNames = require('../error/api-error-names');
const client = new TopClient({
    'appkey': '23587473',
    'appsecret': 'a40191db216f9c795448ea3d5cc4c4b4',
    'REST_URL': 'http://gw.api.taobao.com/router/rest'
});

let captchaMap = {}

const getRandomCaptcha = ()=> {
    let rdm = ''
    for(let i=0; i<6; i++) {
        rdm += parseInt(Math.random()*10)
    }
    return rdm;
}

export function sendReplyNotice(phone, name, issue) {
    const url = config.url;
    return new Promise((resolve, reject)=> {
        client.execute('alibaba.aliqin.fc.sms.num.send', {
            'extend': '123456',
            'sms_type': 'normal',
            'sms_free_sign_name': '子墨文化智慧',
            'sms_param': JSON.stringify({name, issue, url}),
            'rec_num': phone,
            'sms_template_code': 'SMS_73245006'
        }, (error, response)=> {
            if (!error) {
                resolve(response)
            } else {
                reject(error)
            }
        })
    })
}

const sendCaptchaAsync = (phone, code)=> {
    return new Promise((resolve, reject)=> {
        client.execute('alibaba.aliqin.fc.sms.num.send', {
            'extend': '123456',
            'sms_type': 'normal',
            'sms_free_sign_name': '子墨文化智慧',
            'sms_param': JSON.stringify({code}),
            'rec_num': phone,
            'sms_template_code': 'SMS_37535192'
        }, (error, response)=> {
            if (!error) {
                resolve(response)
            } else {
                reject(error)
            }
        })
    })
}

export async function sendCaptchaMsg(ctx, next) {
    let phone, action;
    if(ctx.method === 'GET') {
        phone = ctx.request.query.phone
        action = ctx.request.query.action
    } else {
        phone = ctx.request.body.phone
        action = ctx.request.body.action
    }
    if(!phone) {
        throw new ApiError(ApiErrorNames.PARAM_ILLEGAL)
    }
    if(captchaMap[phone]) {
      ctx.body = {};
    }
    if(action === 'register') {
        let isExist = await isUserExist(phone)
        if(isExist) {
            throw new ApiError(ApiErrorNames.USER_ALREADY_EXIST)
        } else {
            const code = getRandomCaptcha()

            captchaMap[phone] = code;
            //60秒后失效
            setTimeout(()=> {
                delete captchaMap[phone]
            }, 60000)

            const result = await sendCaptchaAsync(phone, code)
            ctx.body = result
        }
    } else {
        const code = getRandomCaptcha()

        captchaMap[phone] = code;
        //60秒后失效
        setTimeout(()=> {
            delete captchaMap[phone]
        }, 60000)

        const result = await sendCaptchaAsync(phone, code)
        ctx.body = result
    }
}

export function validateCaptcha(phone, code) {
    let ret;
    if(!phone || !code) {
        ret = {valid: false, errCode: 'INVALID'}
    }
    if(!captchaMap[phone]) {
        ret = {valid: false, errCode: 'EXPIRED'}
    } else {
        if(code === captchaMap[phone]) {
            delete captchaMap[phone]
            ret = {valid: true}
        } else {
            ret = {valid: false, errCode: 'INCORRECT'}
        }
    }
    return ret

}
