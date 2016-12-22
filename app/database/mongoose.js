const mongoose = require('mongoose')
const dbConfig = require('../../config/db-config');
mongoose.connect(dbConfig.url);

module.exports = mongoose
