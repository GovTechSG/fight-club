var _ = require('lodash');

var serverUtil = {};

let serverTypes = process.env.GAME_SERVER_OPTS_SERVER_TYPE;

serverUtil.checkServerType = function(server) {

    let checkServerType = server;
    var types = serverTypes.split(',');
    var isValidServer = false;
    _.each(types, function(thisType) {
        console.log(checkServerType + ' === ' + thisType);
        if (checkServerType === thisType) {
            isValidServer = true;
        }
    });

    return isValidServer;

};

serverUtil.checkServerTypeHandler = function(server) {

    let instance = this;
    let checkServerType = server;
    return function (req, res, next) {
        let isValidServer = instance.checkServerType(checkServerType);

        if (isValidServer) {
            return next();
        }

        res.status(500);
        res.send('Incorrect server type.');
    };

};

module.exports = serverUtil;