var config = {
    log: {
        level: 'info'
    },
    port: 4999,

    redis: {
        uri: 'redis://docker:6379'
    },
    mongodb: {
        uri: null,
        options: null
        //uri: 'mongodb://docker:27017'
    },
    game: {}
};


module.exports = config;
