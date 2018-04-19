const express = require('express');
const crypto = require("crypto");
const multer = require("multer");
const Promise = require('bluebird');
const isStream = require('is-stream');

const gameService = require('../services/game');

const uuid = require('uuid/v4');

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
    try {
        var game;
        var gameUpdateListener;

        var poll = _.get(req.query, 'poll');

        var updatePromise = null;
        if (!_.isEmpty(poll) && poll==='1') {
            updatePromise = new Promise(function (resolve, reject) {
                try {
                    gameUpdateListener = function (data) {
                        return resolve(data);
                    };

                    gameService.once('update', gameUpdateListener);

                } catch (err) {
                    return reject(err);
                }
            })
                .timeout(120 * 1000)
                .finally(function () {
                    gameService.removeListener('update', gameUpdateListener);
                })
                .catch(Promise.TimeoutError, function () {
                    return null;
                })
        }


        return Promise.props({
            current: gameService.getGame(),
            update: updatePromise
        }).then(function (props) {
            if (!_.isNil(props.update)) {
                return res.jsonp(props.update);
            } else {
                return res.jsonp(props.current);
            }

        });


    } catch (err) {
        return next(err);
    }
});


router.post('/', multer().none(), function (req, res, next) {

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

        return gameService.startNewGame(newGame)
            .then(function (game) {
                return res.jsonp(game);
            });
    } catch (err) {
        return next(err);
    }
});


router.post('/hit', multer().none(), function (req, res, next) {
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
            client_id: _.get(req, 'client_id')
        });


        return gameService.hit({
            team: team, client_data: client_data
        })
            .then(function (game) {
                return res.jsonp(game);
            })
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
