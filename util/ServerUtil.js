var _ = require('lodash');

var serverUtil = {};

let serverTypes = process.env.GAME_SERVER_OPTS_SERVER_TYPE;
serverUtil.checkServerType = function(server) {
    let _serverType = server;
    return function (req, res, next) {
        var types = serverTypes.split(',');
        var isValidServer = false;
        _.each(types, function(thisType) {
            if (_serverType = thisType) {
                isValidServer = true;
            }
        });

        if (isValidServer) {
            return next();
        }

        res.status(500);
        res.send('Incorrect server type.');
    };
};

module.exports = serverUtil;