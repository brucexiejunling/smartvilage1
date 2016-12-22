const mongoose = require('../database/mongoose')
const db = mongoose.connection;

// 此类问题指定农技部门处理
let DisasterSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    area: {type: String},
    content: {type: String},
    imgs: [{type: String}],
    status: {type: Number},
    result: {type: String},
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
    return DisasterModel.find(query)
}

export function update(id, data) {
    const date = new Date()
    data.timestamp = date.getTime()
    data.date = formatDate(date)
    data.user = data.userId
    return DisasterModel.update({_id: id}, {$set: data})
}

export function create(data) {
    const date = new Date()
    data.timestamp = date.getTime()
    data.date = formatDate(date)
    data.user = data.userId
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