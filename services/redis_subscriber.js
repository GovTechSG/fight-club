const config = require('config');
const _ = require("lodash");
const Promise = require('bluebird');
const redis = require('redis');
Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

var redis_config = config.get('redis');

var redis_uri = process.env.REDIS_URI || _.get(redis_config, 'uri');
var redis_dbIndex = process.env.REDIS_DB_INDEX || _.get(redis_config, 'dbIndex');
var redis_options = _.merge({}, _.get(redis_config, 'options'), {
    db: redis_dbIndex
});

var connection = redis.createClient(redis_uri, redis_options);

connection.subscribe('game');

module.exports = connection;
