var serverUtil = {};

let serverType = process.env.GAME_SERVER_OPTS_SERVER_TYPE;
serverUtil.checkServerType = function(server) {
    let _serverType = server;
    return function (req, res, next) {
        if (serverType === _serverType) {
            return next();
        }

        res.status(500);
        res.send('Incorrect server type.');
    };
};

module.exports = serverUtil;