const router = require('koa-router')();
const uploader = require('./upload')
const fs = require('fs')
const path = require('path')
const config = require('../../config/index')

let options = {
    "url": '/ueditor/ue',
    "storeDir": 'images',
    "provider": "local",
    "mimetypes": ['image/png'], // 如果没有配置,将不进行类型检查 www.freeformatter.com/mime-types-list.html
    "folder": "public",
    "urlPath": "/"
}

const getHandler = async(ctx, next)=> {
    let actionType = ctx.query.action
    if(actionType === 'config') {
        ctx.redirect('/ueditor/ueditor.config.json')
    } else if(actionType === 'listimage') {
        const dirPath = path.join(process.cwd(), 'public/images')
        let list = [], dirs = []
        try {
            dirs = fs.readdirSync(dirPath);
        } catch(e) {
            ctx.body = {
                state: "no match file",
                list: [],
                start: 1,
                total: 0
            }
        }
        dirs.forEach((dir)=> {
            let filepath =path.join(process.cwd(), `public/images/${dir}`)
            let files = []
            try {
                files = fs.readdirSync(filepath)
                files.forEach((file)=> {
                    list.push({url: `${config.hostname}/images/${dir}/${file}`})
                })
            } catch (e) {

            }
        })
        ctx.body = {
            state: "SUCCESS",
            list: list,
            start: 1,
            total: list.length
        }
    }
}

const postHandler = async(ctx, next)=> {
    let actionType = ctx.query.action
    if(actionType === 'uploadimage') {
        options.storeDir = 'images'
    } else if(actionType === 'uploadvideo') {
        options.storeDir = 'videos'
        return ctx.body = {}
    } else if(actionType === 'uploadaudio') {
        options.storeDir = 'audios'
        return ctx.body = {}
    } else if(actionType === 'uploadscrawl') {
        options.storeDir = 'images'
        return ctx.body = {}
    }
    await next()
}


router.get('/', getHandler)
router.post('/', postHandler)
router.use('/', uploader(options))

module.exports = router;