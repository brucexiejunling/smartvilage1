const uuid = require("uuid");
const path = require("path");
const parse = require("async-busboy");
const dateformat = require("dateformat");
const config = require('../../config/index')

const uploader = opts => {
    let store;
    try {
        store = require(`./${ opts.provider }`)(opts);
    } catch (err) {
        throw new Error(`Error: ${ err }`);
    }

    return async function(ctx, next) {
        if ("POST" !== ctx.method && !ctx.request.is("multipart/*")) {
            return await next();
        }

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
            state: "SUCCESS",
            title: originName,
            url: `http://${config.hostname}${url}`,
            original: originName
        }
        ctx.body = JSON.stringify(resp);
        return;
    }
}

module.exports = function(opts) {
    return uploader(opts)
}
