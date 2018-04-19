const _ = require('lodash');
const winston = require('winston');

const config = require('config');

var transports = [new (winston.transports.Console)()];

var log_config = config.get('log');

var log_level = _.get(log_config, 'level', 'info');

_.each(_.get(log_config, 'transports'), function (transport) {
    if (_.isPlainObject(transport)) {
        var transport_type = _.get(transport, 'type', 'file');


        if (transport_type === 'syslog') {
            require('winston-syslog').Syslog;
            transports.push(new (winston.transports.Syslog)(transport));
        }
        else if (transport_type === 'file') {
            transports.push(new (winston.transports.File)(transport));
        }


    } else if (_.isString(transport)) {
        transports.push(new (winston.transports.File)({filename: transport}));
    }
});


var logger = new (winston.Logger)({
    level: log_level,
    transports: transports
});


module.exports = logger;
