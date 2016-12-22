import {find}  from '../models/admin-model'
import md5 from 'md5'

const isAdmin = (account, password)=> {
    return new Promise((resolve, reject)=> {
        password = md5(password)
        find({account, password}).lean().exec((err, result)=> {
            if(err) {
                reject(false)
            } else {
                if(result && result.length > 0) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            }
        })
    })
}

module.exports = {isAdmin}


