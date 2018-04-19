const config = require('config');
const _ = require("lodash");
const Promise = require('bluebird');
const redis = require('redis');
Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

var redis_config = config.get('redis');

var redis_uri = _.get(redis_config, 'uri');
var redis_options = _.get(redis_config, 'options');

var connection = redis.createClient(redis_uri, redis_options);

connection.subscribe('game');

module.exports = connection;
