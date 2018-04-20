const _ = require('lodash');
const Promise = require('bluebird');
const redis = require('./redis.js');
const redisPub = require('./redis_publisher.js');
const redisSub = require('./redis_subscriber.js');
const mongodb = require('./mongodb.js');
const io = require('./io.js');
const EventEmitter = require('events');
const config = require('config');

var game_config = config.get('game');


var gameService = new EventEmitter();

gameService.default = {
    red_team: {
        name: _.get(game_config, ['red_team', 'name'], 'Red Team'),
        starting_hp: _.get(game_config, ['red_team', 'starting_hp'], 100)
    },
    blue_team: {
        name: _.get(game_config, ['blue_team', 'name'], 'Blue Team'),
        starting_hp: _.get(game_config, ['blue_team', 'starting_hp'], 100)
    }
};


gameService.startNewGame = function (data) {

    try {
        var newGame = _.cloneDeep(gameService.default);
        _.assign(newGame, data);
        _.set(newGame, ['red_team', 'hp'], _.get(newGame, ['red_team', 'starting_hp']));
        _.set(newGame, ['blue_team', 'hp'], _.get(newGame, ['blue_team', 'starting_hp']));

        return Promise.all([
            redis.setAsync('game', JSON.stringify(newGame)),
            redis.delAsync('red_team_hits'),
            redis.delAsync('blue_team_hits')
        ])
            .then(function () {
                gameService.emit('new_game', newGame);
                gameService.emit('update', newGame);
                return redisPub.publish('game', JSON.stringify({'command': 'update'}));
            })
            .then(function () {
                return newGame;
            });
    } catch (err) {
        return Promise.reject(err);
    }
};


gameService.getGame = function () {
    try {
        return redis.getAsync('game')
            .then(function (game) {
                if (_.isEmpty(game)) {
                    return gameService.startNewGame();
                } else {
                    return JSON.parse(game);
                }
            });
    } catch (err) {
        return Promise.reject(err);
    }
};


gameService.hit = function (data) {
    try {
        var team = _.get(data, 'team');

        if (_.isEmpty(team) || !_.includes(['red', 'blue'], team)) {
            throw new Error("Invalid team!");
        }

        var opposingTeam = team === 'red' ? 'blue' : 'red';

        var client_data = _.get(data, 'client_data');

        return gameService.getGame()
            .then(function (game) {

                var winner = _.get(game, 'winner');
                if (!_.isNil(winner)) {
                    return game;
                }


                return redis.lpushAsync(team + '_team_hits', JSON.stringify(client_data))
                    .then(function (hits) {
                        var updatePromises = [];

                        var opposingTeamHp = _.get(game, [opposingTeam + '_team', 'starting_hp']) - hits;
                        _.set(game, [opposingTeam + '_team', 'hp'], opposingTeamHp);

                        if (opposingTeamHp <= 0) {
                            _.set(game, 'winner', team + '_team');
                        }

                        return redis.setAsync('game', JSON.stringify(game))
                            .then(function () {
                                gameService.emit('hit', _.merge({team: team}, game));
                                gameService.emit('update', game);

                                if (!_.isEmpty(_.get(game, 'winner'))) {
                                    Promise.props({
                                        red_team_hits: redis.lrangeAsync('red_team_hits', 0, -1),
                                        blue_team_hits: redis.lrangeAsync('blue_team_hits', 0, -1)
                                    })
                                        .then(function (props) {
                                            var Game = mongodb.model('Game');
                                            var db_game = new Game(game);
                                            _.set(db_game, ['red_team', 'hits'], _.map(props.red_team_hits, JSON.parse));
                                            _.set(db_game, ['blue_team', 'hits'], _.map(props.blue_team_hits, JSON.parse));
                                            return db_game.save();
                                        });

                                }

                                redisPub.publishAsync('game', JSON.stringify({command: 'update'}))
                                    .return(null);
                            });
                    })
                    .then(function () {
                        return game;
                    });
            })
    } catch (err) {
        return Promise.reject(err);
    }

};


redisSub.on('message', function (channel, message) {
    if (channel === 'game') {
        message = JSON.parse(message);

        console.log(message);

        if (message.command === 'update') {
            return gameService.getGame()
                .then(function (game) {
                    io.emit('update', game);
                });
        }
    }
});


module.exports = gameService;
