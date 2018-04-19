const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const Promise = require('bluebird');

var FileUtil = {};


FileUtil.stat = function (path) {
    return new Promise(function (resolve, reject) {
        try {
            fs.stat(path, function (err, stats) {
                if (!_.isNil(err)) {
                    return reject(err);
                }
                return resolve(stats);
            });
        } catch (err) {
            return reject(err);
        }
    });
};


FileUtil.exists = function (path) {
    return FileUtil.stat(path)
        .then(function () {
            return true;
        })
        .catch(function (err) {
            if (err.code === 'ENOENT') {
                return false;
            } else {
                throw err;
            }
        });
};


FileUtil.unlink = function (path) {
    return new Promise(function (resolve, reject) {
        try {
            fs.unlink(path, function (err) {
                if (!_.isNil(err)) {
                    return reject(err);
                }
                return resolve();
            });
        } catch (err) {
            return reject(err);
        }
    });
};

FileUtil.cp = function (source_path, destination_path) {
    return new Promise(function (resolve, reject) {
        try {


            var readStream = fs.createReadStream(source_path);
            var writeStream = fs.createWriteStream(destination_path);

            readStream.once('end', function () {
                return resolve();
            });

            readStream.once('error', function (err) {
                return reject(err);
            });


            writeStream.once('end', function () {
                return resolve();
            });


            writeStream.once('error', function (err) {
                return reject(err);
            });

            readStream.pipe(writeStream);


        } catch (err) {
            return reject(err);
        }
    });
};


module.exports = FileUtil;
