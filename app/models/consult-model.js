const mongoose = require('../database/mongoose')
const db = mongoose.connection;

let ConsultSchema = new mongoose.Schema({
    publisher: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    department: {type: mongoose.Schema.Types.ObjectId, ref: 'Department'},
    title: {type: String},
    content: {type: String},
    area: {type: String},
    imgs: [{type: String}],
    status: {type: Number}, //0新提交，1. 处理中，2. 已处理, -1. 逻辑删除
    result: {type: String},
    resultImgs: [{type: String}],
    modifier: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    modifyTime: {type: Number},
    date: {type: String},
    timestamp: {type: Number}
})

const ConsultModel = db.model('Consult', ConsultSchema);

function formatDate(date) {
    let year = date.getFullYear(), month = date.getMonth() + 1, day = date.getDate();
    month = month < 10 ? `0${month}` : month;
    day = day < 10 ? `0${day}` : day;
    return `${year}-${month}-${day}`
}

export function findById(id) {
    return ConsultModel.findById(id)
}

export function find(query) {
    return ConsultModel.find(query).where('status').gte(0);
}

export function update(id, data) {
    const date = new Date()
    data.timestamp = date.getTime()
    data.date = formatDate(date)
    return ConsultModel.update({_id: id}, {$set: data})
}

export function create(data) {
    const date = new Date()
    data.timestamp = date.getTime()
    data.date = formatDate(date)
    const consult = new ConsultModel(data);
    return consult.save()
}

export function remove(id) {
    return ConsultModel.findByIdAndRemove(id)
}

function formatDate(date) {
    let year = date.getFullYear(), month = date.getMonth() + 1, day = date.getDate();
    month = month < 10 ? `0${month}` : month;
    day = day < 10 ? `0${day}` : day;
    return `${year}-${month}-${day}`
}