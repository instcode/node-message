var http = require('http');
var WebSocketServer = require('../../node-websocket').server;
var WebSocketConnection = require('../../node-websocket/lib/WebSocketConnection');

exports.createServer = function(handler, options) {
    return new NJMS(handler, options);
}

NJMS = function(handler, options) {
    this.server = new WebSocketServer({
        httpServer: http.createServer(),
        autoAcceptConnections: true
    });

    this.server.on('connect', function(connection) {
        handler.welcome(connection);

        // Hooking the send method for debugging
        connection.send = function(message) {
            console.log('To <' + connection.session.id + ',' + connection.remoteAddress + '>: ' + message);
            connection.sendUTF(message);
        };

        connection.on('message', function(buffer) {
            try {
                var message = buffer.utf8Data;
                if (connection.session === undefined) {
                    console.log('From <' + connection.remoteAddress + '>: ' + message);
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
                connection.drop(
                    [WebSocketConnection.CLOSE_REASON_UNPROCESSABLE_INPUT],
                    ['Malformed']);
                handler.rejected(connection);
                console.log(e.stack);
            }
        });
    });

    this.server.on('close', function(connection) {
        console.log('Connection <' + connection.remoteAddress + '> was closed.');
        handler.close(connection);
    });
}

NJMS.prototype.listenFD = function(fd) {
    this.server.config.httpServer.listenFD(fd);
}

NJMS.prototype.listen = function(port, hostname) {
    this.server.config.httpServer.listen(port, hostname);
}
