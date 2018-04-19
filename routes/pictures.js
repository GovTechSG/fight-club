const express = require('express');
const crypto = require("crypto");
const multer = require("multer");
const Promise = require('bluebird');
const isStream = require('is-stream');


const peek = require('peek-stream');
const fs = require('fs');
const mime = require('mime');
const path = require('path');

const _ = require("lodash");

const FileUtil = require('../util/FileUtil');

const getFileType = require('../util/MimeUtil.js');
const getFileHash = require('../util/HashUtil.js');


var router = express.Router();

router.get('/', function (req, res, next) {
    var mongodb = req.app.locals.mongodb;
    var Picture = mongodb.model('Picture');

    return Picture.find({})
        .then(function (data) {
            return res.jsonp(data);
        })
        .error(function (error) {
            return next(error);
        });
});


var upload = multer({
    dest: 'uploads/'
});


router.post('/', upload.single('picture'), function (req, res, next) {
    try {

        var mongodb = req.app.locals.mongodb;
        var Picture = mongodb.model('Picture');

        var picture_upload_path = req.file.path;

        var name = _.get(req.body, 'name');
        var description = _.get(req.body, 'description');

        var picture;

        if (_.isEmpty(name)) {
            throw new Error('Name cannot be empty.');
        }

        return Promise.props({
            fileType: getFileType(picture_upload_path),
            fileHash: getFileHash(picture_upload_path)
        })
            .then(function (props) {
                var target_file_path = path.join(process.cwd(), 'pictures', props.fileHash + '.' + props.fileType.ext);
                return FileUtil.stat(target_file_path)
                    .then(function () {
                        return FileUtil.exists(target_file_path)
                            .then(function (exists) {
                                if (!exists) {
                                    return FileUtil.cp(picture_upload_path, target_file_path);
                                }
                            });
                    })
                    .then(function () {
                        picture = new Picture({
                            name: name,
                            description: description,
                            file_path: target_file_path
                        });
                        return picture.save();
                    })
            })
            .finally(function () {
                return FileUtil.unlink(picture_upload_path);
            })
            .then(function () {
                return res.jsonp(picture);
            })
            .catch(function (err) {
                return next(err);
            });

    } catch (err) {
        return next(err);
    }

});


module.exports = router;

