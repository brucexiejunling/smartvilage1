const mongoose = require('../database/mongoose')
const db = mongoose.connection;

const AdminSchema = new mongoose.Schema({
    account: {type: String},
    password: {type: String}
})

const AdminModel = db.model('Admin', AdminSchema);

export function find(query) {
    return AdminModel.find(query)
}

