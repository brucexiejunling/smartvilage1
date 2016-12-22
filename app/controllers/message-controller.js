import {isUserExist} from './user-controller'
const TopClient = require('../sdk/alidayu/topClient').TopClient;
const ApiError = require('../error/api-error');
const ApiErrorNames = require('../error/api-error-names');
const client = new TopClient({
    'appkey': '23566124',
    'appsecret': '3dd65021501e12a2f3138618bffdd995',
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

const sendCaptchaAsync = (phone, code)=> {
    return new Promise((resolve, reject)=> {
        client.execute('alibaba.aliqin.fc.sms.num.send', {
            'extend': '123456',
            'sms_type': 'normal',
            'sms_free_sign_name': '智慧乡村',
            'sms_param': JSON.stringify({code}),
            'rec_num': phone,
            'sms_template_code': 'SMS_34405038'
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

    if(!phone || captchaMap[phone]) {
        throw new ApiError(ApiErrorNames.PARAM_ILLEGAL)
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