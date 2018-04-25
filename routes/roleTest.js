"use strict"

const express = require('express');

const ServerUtil = require('../util/ServerUtil');

var router = express.Router();

router.get('/gameMaster', ServerUtil.checkServerType('gamemaster'), function (req, res, next) {
    res.jsonp({ status: 200, message: 'Success. You have access to Game Master\'s APIs.' });
    return;
});

router.get('/damageController', ServerUtil.checkServerType('damagecontroller'), function(req, res, next) {
    res.jsonp({ status: 200, message: 'Success. You have access to Damage Controller\'s APIs.' });
    return;
});

module.exports = router;