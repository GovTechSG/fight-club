const _ = require("lodash");
const fs = require("fs");
const peek = require('peek-stream');
const Promise = require('bluebird');
const crypto = require('crypto');

const fileType = require('file-type');
const mime = require('mime');

var getFileHash = function (file, hash_algo) {
    return new Promise(function (resolve, reject) {
        try {
            if (_.isString(file)) {
                file = fs.createReadStream(file);
            }

            if (_.isNil(hash_algo)) {
                hash_algo = 'sha256';
            }

            var hash = crypto.createHash(hash_algo);

            file.on('data', function (data) {
                try {
                    hash.update(data);
                } catch (err) {
                    return reject(err);
                }
            });

            file.once('end', function () {
                try {
                    return resolve(hash.digest('hex'));
                } catch (err) {
                    return reject(err);
                }
            });

            file.once('error', function (err) {
                return reject(err);
            });

        } catch (err) {
            return reject(err);
        }
    });
};


module.exports = getFileHash;

