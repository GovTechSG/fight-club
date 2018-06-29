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

var logger = winston.createLogger({
    level: log_level,
    format: winston.format.combine(
        winston.format.label({label: 'Woohoo'}),
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: transports
});

// const winston = require('winston');
// const logger = winston.createLogger({
//     level: 'info',
//     format: winston.format.json(),
//     transport: [
//         new winston.transports.Console()
//         // new winston.transports.File({ filename: 'error.log', level: 'error'}),
//         // new winston.transports.File({ filename: 'combined.log' })
//     ]
// });

module.exports = logger;
