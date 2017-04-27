const mongoose = require('../database/mongoose')
const db = mongoose.connection;

let UserSchema = new mongoose.Schema({
    nick: {type: String},
    name: {type: String},
    spell: {type: String},
    gender: {type: String},
    birthplace: {type: String},
    company: {type: String},
    age: {type: Number},
    birthday: {type: String},
    avatar: {type: String},
    account: {type: String},
    password: {type: String},
    phone: {type: String},
    email: {type: String},
    address: {type: String},
    idNumber: {type: String},
    realnameStatus: {type: Number},
    realnameResult: {type: String},
    level: {type: Number}, //1普通用户，2. 乡贤， 3.政府职工，4.部门负责人，5.镇长，书记 
    position: {type: String},
    department: {type: mongoose.Schema.Types.ObjectId, ref: 'Department'}
})

const UserModel = db.model('User', UserSchema);


export function find(query) {
    return UserModel.find(query)
}

export function findAll() {
    return UserModel.find({})
}

export function findById(id) {
   return UserModel.findById(id)
}

export function findByAccount(account) {
    return UserModel.findOne({account})
}

export function update(id, data) {
    return UserModel.update({_id: id}, {$set: data})
}

export function create(data) {
    const um = new UserModel(data);
    return um.save()
}

export function remove(id) {
    return UserModel.findByIdAndRemove(id)
}