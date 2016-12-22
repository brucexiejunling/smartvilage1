const mongoose = require('../database/mongoose')
const db = mongoose.connection;

let ConsultSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    department: {type: mongoose.Schema.Types.ObjectId, ref: 'Department'},
    area: {type: String},
    content: {type: String},
    imgs: [{type: String}],
    status: {type: Number},
    result: {type: String},
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

export function find(query) {
    return ConsultModel.find(query)
}

export function update(id, data) {
    const date = new Date()
    data.timestamp = date.getTime()
    data.date = formatDate(date)
    data.user = data.userId
    data.department = data.department
    return ConsultModel.update({_id: id}, {$set: data})
}

export function create(data) {
    const date = new Date()
    data.timestamp = date.getTime()
    data.date = formatDate(date)
    data.user = data.userId
    data.department = data.department
    const consult = new ConsultModel(data);
    console.log('xxxx', consult)
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