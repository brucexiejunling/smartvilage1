const uuid = require("uuid");
const path = require("path");
const parse = require("async-busboy");
const fs = require('fs')
const dateformat = require("dateformat");
const config = require('../../config/index')
const ApiError = require('../error/api-error');
const ApiErrorNames = require('../error/api-error-names');

let opts = {
    "url": '/',
    "storeDir": 'images',
    "provider": "local",
    "mimetypes": ['image/png'], // 如果没有配置,将不进行类型检查 http://www.freeformatter.com/mime-types-list.html
    "folder": "public",
    "urlPath": "/"
}

const uploadFile = async(ctx, next)=> {
    if(!ctx.session.userId && !ctx.session.isAdmin) {
        throw new ApiError(ApiErrorNames.ACCESS_DENIED)
    }
    let store;
    try {
        store = require(`../sdk/uploader/${ opts.provider }`)(opts);
    } catch (err) {
        throw new Error(`Error: ${ err }`);
        return;
    }
    if ("POST" !== ctx.method && !ctx.request.is("multipart/*")) {
        return await next();
    }

    const type = ctx.query.type, env = ctx.query.env;
    let dir = ''
    if(type === 'image') {
        dir = env === 'front' ? 'pictures' : 'images';
    }
    opts.storeDir = dir;

    // Parse request for multipart
    const { files, fields } = await parse(ctx.req);

    // Generate oss path
    let result = {};
    const storeDir = opts.storeDir ? `${ opts.storeDir }/` : '';
    files.forEach(function (file) {
        result[file.filename] = `${ storeDir }${ dateformat(new Date(), "yyyy-mm-dd") }/${file.filename}`;
    });

    // Upload to OSS or folders
    try {
        await Promise.all(files.map(function (file) {
            return store.put(result[file.filename], file);
        }));
    } catch (err) {
        ctx.status = 500;
        ctx.body = `Error: ${ err }`;
        return;
    }

    // Return result
    ctx.status = 200;

    // Support < IE 10 browser
    ctx.res.setHeader("Content-Type", "text/html");

    const file = store.get(result);
    const originName = Object.keys(file)[0], url = file[originName];
    let resp = {
        name: originName,
        url: `http://${config.hostname}${url}`,
    }
    ctx.body = resp
    return;
}


const listFiles = async(ctx, next)=> {
    const type = ctx.query.type, env = ctx.query.env;
    let localPath = 'public/', subPath = ''
    if(type === 'image') {
        subPath = env === 'front' ? 'pictures' : 'images'
    }
    localPath = localPath + subPath;
    const dirPath = path.join(process.cwd(), localPath)
    let list = [], dirs = []
    try {
        dirs = fs.readdirSync(dirPath);
    } catch(e) {
        ctx.body = {
            data: [],
            total: 0
        }
    }
    dirs.forEach((dir)=> {
        let filepath =path.join(process.cwd(), `${localPath}/${dir}`)
        let files = []
        try {
            files = fs.readdirSync(filepath)
            files.forEach((file)=> {
                list.push({url: `http://${config.hostname}/${subPath}/${dir}/${file}`})
            })
        } catch (e) {
            ctx.body = {
                data: [],
                total: 0
            }
        }
    })
    //分页
    const offset = ctx.query.offset ? parseInt(ctx.query.offset) : 0, pageSize = ctx.query.pageSize ? parseInt(ctx.query.pageSize) : list.length;
    const newList = list.slice(offset, offset + pageSize)
    ctx.body = {
        data: newList,
        total: list.length
    }
}

const deleteFile = async(ctx, next)=> {
    if(!ctx.session.userId && !ctx.session.isAdmin) {
        throw new ApiError(ApiErrorNames.ACCESS_DENIED)
    }
    let filepath = ctx.request.body.url
    const type = ctx.query.type, env = ctx.query.env;
    if(!filepath || !type || !env) {
        throw new ApiError(ApiErrorNames.PARAM_ILLEGAL)
    }

    if(type === 'image') {
        let subpath = env === 'front' ? '/pictures/' : '/images/'
        let idx = filepath.indexOf(subpath)
        filepath = path.join(process.cwd(), '/public' + filepath.substr(idx))
        try {
            const result = fs.unlinkSync(filepath);
            ctx.body = result
        } catch(e) {
            throw new ApiError(ApiErrorNames.UNKNOW_ERROR)
        }
    }
}

module.exports = {uploadFile, listFiles, deleteFile}
