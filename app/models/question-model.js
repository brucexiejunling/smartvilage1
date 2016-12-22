const mongoose = require('../database/mongoose')
const db = mongoose.connection;

let QuestionSchema = new mongoose.Schema({
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

const QuestionModel = db.model('Question', QuestionSchema);


function formatDate(date) {
    let year = date.getFullYear(), month = date.getMonth() + 1, day = date.getDate();
    month = month < 10 ? `0${month}` : month;
    day = day < 10 ? `0${day}` : day;
    return `${year}-${month}-${day}`
}

export function find(query) {
    return QuestionModel.find(query)
}

export function update(id, data) {
    const date = new Date()
    data.timestamp = date.getTime()
    data.date = formatDate(date)
    data.user = data.userId
    data.department = data.department
    return QuestionModel.update({_id: id}, {$set: data})
}

export function create(data) {
    const date = new Date()
    data.timestamp = date.getTime()
    data.date = formatDate(date)
    data.user = data.userId
    data.department = data.department
    const Question = new QuestionModel(data);
    return Question.save()
}

export function remove(id) {
    return QuestionModel.findByIdAndRemove(id)
}

function formatDate(date) {
    let year = date.getFullYear(), month = date.getMonth() + 1, day = date.getDate();
    month = month < 10 ? `0${month}` : month;
    day = day < 10 ? `0${day}` : day;
    return `${year}-${month}-${day}`
}