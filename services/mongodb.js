const config = require('config');
const _ = require('lodash');
const Promise = require('bluebird');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

mongoose.Promise = Promise;

var mongodb_config = config.get('mongodb');

var mongodb_uri = _.get(mongodb_config, 'uri');
var mongodb_options = _.get(mongodb_config, 'options');

var connection = mongoose.createConnection(mongodb_uri, mongodb_options);

var models_path = path.join(process.cwd(), 'models');
var model_files = fs.readdirSync(models_path);
_.each(model_files, function (filename) {
    if (filename.endsWith('.js')) {
        var file_path = path.join(models_path, filename);
        var file_basename = path.basename(filename, '.js');
        var schema = require(file_path);
        connection.model(file_basename, schema);
    }
});


module.exports = connection;
