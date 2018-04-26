const Promise = require('bluebird');
const _ = require("lodash");
const game = require('../services/game.js');
const cookie = require('cookie');
const superagent = require('superagent');

const os = require('os');
const hostname = os.hostname();
const ServerUtil = require('../util/ServerUtil');

module.exports = function (services) {

    var io = _.get(services, 'io');
    var socket = _.get(services, 'socket');
    var redis = _.get(services, 'redis');
    var redisPub = _.get(services, 'redisPub');
    var redisSub = _.get(services, 'redisSub');
    var mongodb = _.get(services, 'mongodb');
    var game = _.get(services, 'game');

    // var hitHandler = function (data) {
    //
    //     var team = _.get(data, 'team');
    //
    //     var req = _.get(socket, 'request');
    //
    //     var client_ip = _.get(socket, 'conn.remoteAddress');
    //     var xForwardedForHeader = _.get(req.headers, 'x-forwarded-for');
    //     if (!_.isEmpty(xForwardedForHeader)) {
    //         client_ip = xForwardedForHeader.split(',')[0];
    //     }
    //
    //
    //     var cookieHeader = _.get(req.headers, 'cookie');
    //     var client_id = null;
    //     if (!_.isEmpty(cookieHeader)) {
    //         cookieHeader = cookie.parse(cookieHeader);
    //         client_id = _.get(cookieHeader, 'id');
    //     }
    //
    //     var client_data = _.merge({}, _.pick(req.headers, [
    //         'forwarded',
    //         'x-forwarded-for',
    //         'x-forwarded-host',
    //         'x-forwarded-proto',
    //         'via',
    //         'user-agent',
    //         'referer'
    //     ]), {
    //         ip: client_ip,
    //         client_id: client_id
    //     });
    //
    //     console.log(client_data);
    //
    //     return game.hit({
    //         team: team, client_data: client_data
    //     })
    //         .catch(function (err) {
    //             _.set(game, 'hostname', hostname);
    //             socket.emit('error', err);
    //         });
    // };

    var attackHandler = function (data) {

        return new Promise(function(resolve, reject) {
            var reqUrl = process.env.GAME_DAMAGE_CONTROLLER_PROTOCOL + "://" + process.env.GAME_DAMAGE_CONTROLLER_HOST + ":" + process.env.GAME_DAMAGE_CONTROLLER_PORT;
            reqUrl += '/game/hit';
            superagent.post(reqUrl)
                .send(data)
                .then(function(result) {
                    return Promise.resolve(result.body);
                })
                .catch(function(err) {
                    _.set(game, 'hostname', hostname);
                    socket.emit('error', err);
                    return Promise.reject(err);
                });

        });
    };

    var newGameHandler = function (data) {
        return game.startNewGame(data)
            .catch(function (err) {
                _.set(game, 'hostname', hostname);
                socket.emit('error', err);
            });
    };

    var refreshHandler = function (data) {
        return game.getGame()
            .then(function (game) {
                _.set(game, 'hostname', hostname);
                socket.emit('update', game);
            })
            .catch(function (err) {
                _.set(game, 'hostname', hostname);
                socket.emit('error', err);
            });
    };

    // if (ServerUtil.checkServerType('damagecontroller')) {
    //     socket.on('hit', hitHandler);
    // }
    // else
    if (ServerUtil.checkServerType('gamemaster')) {
        socket.on('newGame', newGameHandler);
        socket.on('refresh', refreshHandler);
        socket.on('attack', attackHandler);
    }

};
