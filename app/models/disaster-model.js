const mongoose = require('../database/mongoose')
const db = mongoose.connection;

// 此类问题指定农技部门处理
let DisasterSchema = new mongoose.Schema({
    publisher: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    department: {type: mongoose.Schema.Types.ObjectId, ref: 'Department'},
    area: {type: String},
    title: {type: String},
    content: {type: String},
    imgs: [{type: String}],
    status: {type: Number}, //0新提交，1. 处理中，2. 已处理, 3.逻辑删除
    result: {type: String},
    resultImgs: [{type: String}],
    modifier: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    modifyTime: {type: Number},
    date: {type: String},
    timestamp: {type: Number}
})

const DisasterModel = db.model('Disaster', DisasterSchema);


function formatDate(date) {
    let year = date.getFullYear(), month = date.getMonth() + 1, day = date.getDate();
    month = month < 10 ? `0${month}` : month;
    day = day < 10 ? `0${day}` : day;
    return `${year}-${month}-${day}`
}

export function find(query) {
    return DisasterModel.find(query).where('status').gte(0);
}

export function findById(id) {
    return DisasterModel.findById(id)
}

export function update(id, data) {
    const date = new Date()
    data.timestamp = date.getTime()
    data.date = formatDate(date)
    return DisasterModel.update({_id: id}, {$set: data})
}

export function create(data) {
    const date = new Date()
    data.timestamp = date.getTime()
    data.date = formatDate(date)
    const Disaster = new DisasterModel(data);
    return Disaster.save()
}

export function remove(id) {
    return DisasterModel.findByIdAndRemove(id)
}

function formatDate(date) {
    let year = date.getFullYear(), month = date.getMonth() + 1, day = date.getDate();
    month = month < 10 ? `0${month}` : month;
    day = day < 10 ? `0${day}` : day;
    return `${year}-${month}-${day}`
}