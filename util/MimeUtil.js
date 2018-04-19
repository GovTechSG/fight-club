const _ = require("lodash");
const fs = require("fs");
const peek = require('peek-stream');
const Promise = require('bluebird');

const fileType = require('file-type');

var getFileType = function (file) {
    return new Promise(function (resolve, reject) {
        try {
            if (_.isString(file)) {
                file = fs.createReadStream(file);
            }

            var current_pos = 0;
            var magic_bytes_buffer = Buffer.alloc(4100, 0);

            file.on('data', function (data) {
                try {
                    var bytes_to_write = Math.max(data.length, 4100 - current_pos);
                    data.copy(magic_bytes_buffer, current_pos, 0, bytes_to_write);
                    current_pos += bytes_to_write;

                    if (current_pos >= 4100) {
                        return resolve(fileType(magic_bytes_buffer));
                    }
                } catch (err) {
                    return reject(err);
                }
            });

            file.once('end', function () {
                try {
                    return resolve(fileType(magic_bytes_buffer));
                } catch (err) {
                    return reject(err);
                }
            });

            file.once('error', function (err) {
                return reject(err);
            })

        } catch (err) {
            return reject(err);
        }
    });
};


module.exports = getFileType;
