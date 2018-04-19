const Promise = require('bluebird');
const _ = require("lodash");
const game = require('../services/game.js');
const cookie = require('cookie');


module.exports = function (services) {

    var io = _.get(services, 'io');
    var socket = _.get(services, 'socket');
    var redis = _.get(services, 'redis');
    var redisPub = _.get(services, 'redisPub');
    var redisSub = _.get(services, 'redisSub');
    var mongodb = _.get(services, 'mongodb');
    var game = _.get(services, 'game');

    socket.on('hit', function (data) {
        var team = _.get(data, 'team');

        var req = _.get(socket, 'request');

        var client_ip = _.get(socket, 'conn.remoteAddress');
        var xForwardedForHeader = _.get(req.headers, 'x-forwarded-for');
        if (!_.isEmpty(xForwardedForHeader)) {
            client_ip = xForwardedForHeader.split(',')[0];
        }


        var cookieHeader = _.get(req.headers, 'cookie');
        var client_id = null;
        if (!_.isEmpty(cookieHeader)) {
            cookieHeader = cookie.parse(cookieHeader);
            client_id = _.get(cookieHeader, 'id');
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
            ip: client_ip,
            client_id: client_id
        });

        console.log(client_data);

        return game.hit({
            team: team, client_data: client_data
        })
            .catch(function (err) {
                socket.emit('error', err);
            });
    });

    socket.on('newGame', function (data) {
        return game.startNewGame(data)
            .catch(function (err) {
                socket.emit('error', err);
            });
    });


    socket.on('refresh', function (data) {
        return game.getGame()
            .then(function (game) {
                socket.emit('update', game);
            })
            .catch(function (err) {
                socket.emit('error', err);
            });
    });

};
