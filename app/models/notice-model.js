const mongoose = require('../database/mongoose')
const db = mongoose.connection;

let NoticeSchema = new mongoose.Schema({
    publisher: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    receiver: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    receiverType: {type: Number},
    receiverDepartment: {type: mongoose.Schema.Types.ObjectId, ref: 'Department'},
    title: {type: String},
    content: {type: String},
    imgs: [{type: String}],
    date: {type: String},
    timestamp: {type: Number},
    handlers: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
})

const NoticeModel = db.model('Notice', NoticeSchema);


function formatDate(date) {
    let year = date.getFullYear(), month = date.getMonth() + 1, day = date.getDate();
    month = month < 10 ? `0${month}` : month;
    day = day < 10 ? `0${day}` : day;
    return `${year}-${month}-${day}`
}

export function findById(id) {
    return NoticeModel.findById(id)
}

export function find(query) {
    return NoticeModel.find(query)
}

export function update(id, data) {
    const date = new Date()
    data.timestamp = date.getTime()
    data.date = formatDate(date)
    return NoticeModel.update({_id: id}, {$set: data})
}

export function create(data) {
    const date = new Date()
    data.timestamp = date.getTime()
    data.date = formatDate(date)
    const Notice = new NoticeModel(data);
    return Notice.save()
}

export function remove(id) {
    return NoticeModel.findByIdAndRemove(id)
}