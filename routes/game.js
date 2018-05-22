"use strict"

const express = require('express');
const crypto = require("crypto");
const multer = require("multer");
const Promise = require('bluebird');
const isStream = require('is-stream');
const moment = require('moment');

const gameService = require('../services/game');

const uuid = require('uuid/v4');

const peek = require('peek-stream');
const fs = require('fs');
const path = require('path');

const _ = require("lodash");

const FileUtil = require('../util/FileUtil');
const ServerUtil = require('../util/ServerUtil');

const getFileType = require('../util/MimeUtil.js');
const getFileHash = require('../util/HashUtil.js');
const os = require('os');
const superagent = require('superagent');

const hostname = os.hostname();

var router = express.Router();

router.post('/poll', ServerUtil.checkServerTypeHandler('gamemaster'), function (req, res, next) {
    try {
        var poll = _.get(req.body, 'poll');

        var updatePromise = Promise.resolve(null);
        if (!_.isEmpty(poll) && poll === '1') {
            let gameUpdateListener;
            updatePromise = new Promise(function (resolve, reject) {
                gameUpdateListener = function (data) {
                    console.log(moment().format('h:mm:ss') + ' received update event.');
                    return resolve(data);
                };

                gameService.once('update', gameUpdateListener);

                console.log(moment().format('h:mm:ss') + ' registered poll');
            })
                .timeout(2 * 1000)
                .finally(function () {
                    gameService.removeListener('update', gameUpdateListener);
                })
                .catch(Promise.TimeoutError, function () {
                    return null;
                })
        }


        return updatePromise
            .then(function (updatedGame) {
                if (_.isNil(updatedGame)) {
                    return gameService.getGame();
                }
                else {
                    return updatedGame;
                }
            })
            .then(function(game) {

                console.log(moment().format('h:mm:ss') + ' returning results -----------------');
                console.log(game);

                _.set(game, 'hostname', hostname);
                return res.jsonp(game);

            });


    } catch (err) {
        return next(err);
    }
});

router.post('/', ServerUtil.checkServerTypeHandler('gamemaster'), multer().none(), function (req, res, next) {

    try {

        var newGame = _.cloneDeep(gameService.default);

        if (_.has(req.body, 'red_team_name')) {
            _.set(newGame, ['red_team', 'name'], _.get(req.body, 'red_team_name'));
        }

        if (_.has(req.body, 'blue_team_name')) {
            _.set(newGame, ['blue_team', 'name'], _.get(req.body, 'blue_team_name'));
        }

        if (_.has(req.body, 'red_team_hp')) {
            _.set(newGame, ['red_team', 'starting_hp'], _.get(req.body, 'red_team_hp'));
        }

        if (_.has(req.body, 'blue_team_hp')) {
            _.set(newGame, ['blue_team', 'starting_hp'], _.get(req.body, 'blue_team_hp'));
        }

        return gameService.newGame(newGame)
            .then(function (game) {
                _.set(game, 'hostname', hostname);

                return res.jsonp(game);
            });
    } catch (err) {
        return next(err);
    }
});

router.post('/start', ServerUtil.checkServerTypeHandler('gamemaster'), multer().none(), function (req, res, next) {

    try {
        var options = {};
        return gameService.startGame(options)
            .then(function (game) {
                return res.jsonp(game);
            })
    } catch (err) {
        return next(err);
    }

});

router.post('/hit', ServerUtil.checkServerTypeHandler('damagecontroller'),  multer().none(), function (req, res, next) {
    try {

        var team = _.get(req.body, 'team');

        if (_.isEmpty(team)) {
            throw new Error("Team required!");
        }

        if (!_.includes(['red', 'blue'], team)) {
            throw new Error("Invalid team!");
        }


        var client_data = _.merge({}, _.pick(req.headers, [
            'forwarded',
            'x-forwarded-for',
            'x-forwarded-host',
            'x-forwarded-proto',
            'via',
            'user-agent',
            'referer'
        ]), {
            ip: _.get(req, 'ip'),
            client_id: _.get(req, 'client_id'),
            server_hostname: hostname
        });


        return gameService.hit({
            team: team, client_data: client_data
        })
            .then(function (game) {
                _.set(game, 'hostname', hostname);
                return res.jsonp(game);
            });
    } catch (err) {
        return next(err);
    }
});

router.post('/attack', ServerUtil.checkServerTypeHandler('gamemaster'), multer().none(), function (req, res, next) {

    var reqBody = _.get(req, 'body');
    return new Promise(function (resolve, reject) {
        var reqUrl = process.env.GAME_DAMAGE_CONTROLLER_PROTOCOL + "://" + process.env.GAME_DAMAGE_CONTROLLER_HOST + ":" + process.env.GAME_DAMAGE_CONTROLLER_PORT;
        reqUrl += '/game/hit';
        superagent.post(reqUrl)
            .send(reqBody)
            .then(function(response) {
                var result = response.body;
                res.jsonp(result);
                return Promise.resolve(result);
            })
            .catch(function(err) {
                return Promise.reject(err);
            });
    })

});


module.exports = router;
