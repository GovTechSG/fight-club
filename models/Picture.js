const Schema = require('mongoose').Schema;

module.exports = new Schema({
    name: String,
    description: String,
    file_path: String
});
