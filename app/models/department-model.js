const mongoose = require('../database/mongoose')
const db = mongoose.connection;

let DepartmentSchema = new mongoose.Schema({
    name: {type: String},
    desc: {type: String},
    office: {type: String},
    incharges: [{name: String, spell: String, phone: String, position: String}]
})

const DepartmentModel = db.model('Department', DepartmentSchema);

export function findByName(name) {
   return DepartmentModel.find({name});
}

export function findAll() {
   return DepartmentModel.find()
}

export function update(id, data) {
    return DepartmentModel.update({_id: id}, {$set: data})
}

export function create(data) {
    const dm = new DepartmentModel(data);
    return dm.save()
}

export function remove(id) {
    return DepartmentModel.findByIdAndRemove(id)
}

