var ws = require('../../node-websocket-server/lib/ws/server');
var Connection = require('../../node-websocket-server/lib/ws/connection');

exports.createServer = function(handler, options) {
    return new NJMS(handler, options);
}

NJMS = function(handler, options) {
    var server = ws.createServer(options);
    server.addListener('connection', function(connection) {
        // Hooking the send method for debugging
        connection.send = function(message) {
            console.log('To <' + connection.session.id + ',' + connection.id + '>: ' + message);
            Connection.prototype.send.apply(connection, arguments);
        };

        connection.addListener('message', function(message) {
            if (connection.session === undefined) {
                console.log('From <' + connection.id + '>: ' + message);
            }
            else {
                console.log('From [' + connection.session.id + ']: ' + message);
            }
            handler.handle(connection, message);
        });

        connection.addListener('rejected', function(message) {
        });
    });

    server.addListener('disconnect', function(connection) {
        console.log('Connection <' + connection.id + '> was closed.');
    });

    return server;
}

