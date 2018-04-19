var config = {
    log: {
        level: 'info'
    },
    port: 3000,

    redis: {
        uri: 'redis://redis:6379'
    },
    mongodb: {
        uri: 'mongodb://mongo:27017'
    }
};

module.exports = config;
