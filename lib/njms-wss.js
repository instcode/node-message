var ws = require('../../node-websocket-server/lib/ws/server');
var Connection = require('../../node-websocket-server/lib/ws/connection');

exports.createServer = function(handler, options) {
    return new NJMS(handler, options);
}

NJMS = function(handler, options) {
    //options = {debug: true};
    this.server = ws.createServer(options);

    this.server.addListener('connection', function(connection) {
        handler.welcome(connection);

        // Hooking the send method for debugging
        connection.send = function(message) {
            console.log('To <' + connection.session.id + ',' + connection.id + '>: ' + message);
            Connection.prototype.send.apply(connection, arguments);
        };

        connection.addListener('message', function(message) {
            try {
                if (connection.session === undefined) {
                    console.log('From <' + connection.id + '>: ' + message);
                }
                else {
                    console.log('From [' + connection.session.id + ']: ' + message);
                }
                handler.handle(connection, message);
            }
            catch (e) {
                // The client tried to fool us with a malformed message. In
                // this case, we punish the client by adding it to the black
                // list and force the connection closed. This is why we don't
                // trust any client!
                connection.reject(['malformed']);
                console.log(e.stack);
            }
        });

        connection.addListener('rejected', function(message) {
            try {
                console.log('Rejected: ' + message);
                handler.rejected(connection);
            }
            catch (e) {
                console.log(e.stack);
            }
        });
    });

    this.server.addListener('disconnect', function(connection) {
        console.log('Connection <' + connection.id + '> was closed.');
        handler.close(connection);
    });
}

NJMS.prototype.listenFD = function(fd) {
    this.server.server.listenFD(fd);
}

NJMS.prototype.listen = function(port, hostname) {
    this.server.server.listen(port, hostname);
}
