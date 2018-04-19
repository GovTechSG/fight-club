const config = require('config');
const logger = require('./services/logger.js');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const routes = require('./routes/index.js');
const helmet = require("helmet");
const cors = require("cors");
const csurf = require("csurf");
const _ = require("lodash");
const morgan = require('morgan');
const compression = require("compression");
const serveStatic = require('serve-static');


var app = express();

app.set('trust proxy', true);

app.locals.config = config;
app.locals.logger = logger;
app.locals.csrfProtection = csurf({cookie: true});

app.use(morgan('combined', {
    stream: {
        write: function (message) {
            logger.info(message);
        }
    }
}));

var compression_config = config.has('compression') ? config.get('compression') : undefined;
if (!_.isUndefined(compression_config) && !_.has(compression_config, 'filter')) {
    compression_config.filter = function (req, res) {
        if (_.get(req.headers, 'x-no-compression')) {
            return false;
        }

        return compression.filter(req, res);
    }
}

app.use(compression(compression_config));


var helmet_config = config.has('helmet') ? config.get('helmet') : undefined;
app.use(helmet(helmet_config));

var cors_config = config.has('cors') ? config.get('cors') : undefined;
app.use(cors(cors_config));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

app.use('/', routes);

app.use(serveStatic('static', {'index': ['index.html', 'index.htm']}));

app.use(function (request, response, next) {
    var error = new Error("Not Found");
    error.status = 404;
    next(error);
});

app.use(function (error, request, response, next) {
    logger.error(error);

    var error_response = _.pick(error, ['message', 'status']);
    if (process.env.NODE_ENV === 'production') {
        error_response.stack = error.stack;
    }
    return response.jsonp(error_response);
});

module.exports = app;
