const Server = require('socket.io');


var io = new Server({
    path: '/sockets'
});

module.exports = io;
