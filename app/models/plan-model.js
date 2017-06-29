const mongoose = require('../database/mongoose')
const db = mongoose.connection;

let handlerSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    username: {type: String},
    status: {type: Number}, //0未处理，1处理中，2已处理
    result: {type: String}, //回复
    imgs: [{type: String}] //回复图片
});

let PlanSchema = new mongoose.Schema({
    status: {type: mongoose.Schema.Types.Number}, //0有效，-1取消
    publisher: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    receiver: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    receiverType: {type: Number},
    receiverDepartment: {type: mongoose.Schema.Types.ObjectId, ref: 'Department'},
    title: {type: String},
    content: {type: String},
    imgs: [{type: String}],
    startDate: {type: String},
    endDate: {type: String},
    date: {type: String},
    timestamp: {type: Number},
    handlers: [handlerSchema]
})

const PlanModel = db.model('Plan', PlanSchema);


function formatDate(date) {
    let year = date.getFullYear(), month = date.getMonth() + 1, day = date.getDate();
    month = month < 10 ? `0${month}` : month;
    day = day < 10 ? `0${day}` : day;
    return `${year}-${month}-${day}`
}

export function findById(id) {
    return PlanModel.findById(id)
}

export function find(query) {
    return PlanModel.find(query).where('status').ne(-1);
}

export function update(id, data) {
    const date = new Date()
    data.timestamp = date.getTime()
    data.date = formatDate(date)
    return PlanModel.update({_id: id}, {$set: data})
}

export function create(data) {
    const date = new Date()
    data.timestamp = date.getTime()
    data.date = formatDate(date)
    const Plan = new PlanModel(data);
    return Plan.save()
}

export function remove(id) {
    return PlanModel.findByIdAndRemove(id)
}