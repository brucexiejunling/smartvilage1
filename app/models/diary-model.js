const mongoose = require('../database/mongoose')
const db = mongoose.connection;

let DiarySchema = new mongoose.Schema({
    publisher: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    publisherDep: {type: mongoose.Schema.Types.ObjectId, ref: 'Department'},
    title: {type: String},
    content: {type: String},
    imgs: [{type: String}],
    date: {type: String},
    timestamp: {type: Number}
})

const DiaryModel = db.model('Diary', DiarySchema);


function formatDate(date) {
    let year = date.getFullYear(), month = date.getMonth() + 1, day = date.getDate();
    month = month < 10 ? `0${month}` : month;
    day = day < 10 ? `0${day}` : day;
    return `${year}-${month}-${day}`
}

export function findById(id) {
    return DiaryModel.findById(id)
}

export function find(query) {
    return DiaryModel.find(query)
}

export function update(id, data) {
    const date = new Date()
    data.timestamp = date.getTime()
    data.date = formatDate(date)
    return DiaryModel.update({_id: id}, {$set: data})
}

export function create(data) {
    const date = new Date()
    data.timestamp = date.getTime()
    data.date = formatDate(date)
    const Diary = new DiaryModel(data);
    return Diary.save()
}

export function remove(id) {
    return DiaryModel.findByIdAndRemove(id)
}