const mongoose = require('../database/mongoose')
const db = mongoose.connection;

let PageSchema = new mongoose.Schema({
    name: {type: String},
    text: {type: String},
    desc: {type: String},
    group: {type: String},
    url: {type: String},
    banners: [{img: String, url: String}],
    tabs: {type: Array},
    types: {type: Object}
})

const PageModel = db.model('Page', PageSchema);

export function find(query) {
    if(query._id) {
        return PageModel.findById(query._id)
    } else {
        return PageModel.findOne(query)
    }
}

export function findAll() {
    return PageModel.find()
}

export function update(query, data) {
    return PageModel.update(query, {$set: data})
}

export function create(data) {
    const page = new PageModel(data);
    return page.save()
}

async function findAndRemove(query) {
    const result = await PageModel.findOne(query)
    if(result) {
        return result.remove()
    }
}
export function remove(query) {
   if(query._id) {
       return PageModel.findByIdAndRemove(query._id)
   } else {
       return findAndRemove()
   }
}

