var _ = require('lodash');

var serverUtil = {};

let serverTypes = process.env.GAME_SERVER_OPTS_SERVER_TYPE;

serverUtil.checkServerType = function(validServerTypes) {

    let _validServerTypes = validServerTypes.split(',');
    let thisServerTypes = serverTypes.split(',');
    let intersect = _.intersection(thisServerTypes, _validServerTypes);
    return _.size(intersect) > 0;

};

serverUtil.checkServerTypeHandler = function(validServerTypes) {

    let instance = this;
    let _validServerTypes = validServerTypes;
    return function (req, res, next) {
        let isValidServer = instance.checkServerType(_validServerTypes);

        if (isValidServer) {
            return next();
        }

        res.status(500);
        res.send('Incorrect server type.');
    };

};

module.exports = serverUtil;