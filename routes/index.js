const express = require('express');
const crypto = require("crypto");
const multer = require("multer");
const Promise = require('bluebird');
const isStream = require('is-stream');


const peek = require('peek-stream');
const fs = require('fs');
const path = require('path');

const _ = require("lodash");

const FileUtil = require('../util/FileUtil');

const getFileType = require('../util/MimeUtil.js');
const getFileHash = require('../util/HashUtil.js');
const uuid = require('uuid/v4');

var router = express.Router();


router.use(function (req, res, next) {
    var client_id = _.get(req.cookies, 'id');
    if (_.isEmpty(client_id)) {
        client_id = uuid();
        res.cookie('id', client_id);
    }

    _.set(req, 'client_id', client_id);

    return next();
});


// router.get('/', function (req, res, next) {
//     return res.jsonp({status: 'OK'});
// });

router.get('/random', function (req, res, next) {
    var randomBytes = Buffer.from(crypto.randomBytes(1024));
    return res.jsonp({random: randomBytes.toString('hex')});
});


router.use('/game', require('./game.js'));
router.use('/pictures', require('./pictures.js'));

module.exports = router;

