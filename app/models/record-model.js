const mongoose = require('../database/mongoose');
const db = mongoose.connection;

const signSchema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  time: {type: String},
  location: {type: String}
});

let RecordSchema = new mongoose.Schema({
  date: { type: String },
  isSystem: {type: Boolean}, //是否系统设置的标准签到签退时间，所有考勤，以这条时间标准
  signinTime: { type: String },
  signoutTime: {type: String},
  signiners: [signSchema],
  signouters: [signSchema]
});

const RecordModel = db.model('Record', RecordSchema);

export function findById(id) {
  return RecordModel.findById(id);
}

export function findOne(query) {
  return RecordModel.findOne(query);
}

export function find(query) {
  return RecordModel.find(query);
}

export function update(id, data) {
  const date = new Date();
  data.date = formatDate(date);
  return RecordModel.update({ _id: id }, { $set: data });
}

export function create(data) {
  if(!data.date) {
    const date = new Date();
    data.date = formatDate(date);
  }
  const record = new RecordModel(data);
  return record.save();
}

export function remove(id) {
  return RecordModel.findByIdAndRemove(id);
}

function formatDate(date) {
  let year = date.getFullYear(),
    month = date.getMonth() + 1,
    day = date.getDate();
  month = month < 10 ? `0${month}` : month;
  day = day < 10 ? `0${day}` : day;
  return `${year}-${month}-${day}`;
}
