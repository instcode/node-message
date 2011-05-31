var Message = require('./message');

var Sessions = require('./service/sessions');
var Channels = require('./service/channels');
var Presences = require('./service/presences');

Handlers = function() {
}

module.exports = Handlers;

/**
 * A warm welcome or bye bye if the ip address was in the blacklist.
 */
Handlers.prototype.welcome = function(connection) {
    // Reject connection if it is in the blacklist
}

/**
 * Handle the incoming message from the connection
 */
Handlers.prototype.handle = function(connection, message) {
    command = JSON.parse(message);
    var handler = this.handlers[command.action];
    handler(connection, command);
}

/**
 * Clean up the connection
 */
Handlers.prototype.close = function(connection) {
    var session = connection.session;
    if (session !== undefined) {
        session.detach(connection);
    }
}

/**
 * Add the connection to the blacklist. The following data are collected
 * to identify this connection:
 *      + ip address
 *      + session
 */
Handlers.prototype.rejected = function(connection) {

}

Handlers.prototype.handlers = {};

/**
 * Handle authentication with id & token. The result will be sent directly to
 * the user on this requesting connection.
 */
Handlers.prototype.handlers[Message.CONNECT] = function(connection, command) {
    var id = command.params.username;
    var token = command.params.token;
    var status = command.params.status;
    var session = connection.session;
    
    if (session === undefined) {
        session = Sessions.authSession(id, token);
        if (session === null) {
            var metadata = {error: 1, contacts: [], messages: []};
            var message = Message.create(Message.CONNECT, metadata);
            // Failed to retrieve the session
            connection.send(message);
            return;
        }

        // The system only supports a specific number of concurrent connections.
        // When this number exceeds the limit, the system will drop the *least
        // recently established connection* (lrec).
        var lrec = session.attach(connection);
        if (lrec !== null) {
            console.log('Too many connections! Drop <' + session.id + ',' + lrec.id + '>');
            lrec.close();
        }
    }

    var metadata = {
        error: 0,
        timestamp: Date.now(),
        contacts: Sessions.getBuddyList(session),
        messages: Sessions.getMessages(session)
    };
    var message = Message.create(Message.CONNECT, metadata);
    connection.send(message);
    
    // Update the presence of the given session and notify his/her buddy list
    metadata = {
        connection: connection,
        session: session,
        status: status
    };
    Presences.changeStatus(metadata);
}

Handlers.prototype.handlers[Message.MESSAGE] = function(connection, command) {
    var session = connection.session;
    var channels = command.params.channel;
    // Private or Broadcast
    /*
    if (channels.length !== undefined) {
        for (var i = 0; i < channels.length; i++) {
            var channel = Channels.getPrivateChannel(channels[i]);
            if (channel !== undefined) {
                channel.publish(message, metadata);
            }
        }
    }
    //*/

    var channel = Channels.getChannel(command.params.channel);
    if (!channel.has(session)) {
        throw new Error('Not in the channel!');
    }
    var metadata = {
        connection: connection,
        session: session,
        channel: command.params.channel,
        timestamp: Date.now(),
        message: command.params.msg
    };

    var message = Message.create(Message.MESSAGE, metadata);
    channel.publish(message, metadata);
}

Handlers.prototype.handlers[Message.LIST] = function(connection, command) {
    var session = connection.session;
    var channels = Channels.getChannels(session);
    var metadata = {
        channels: channels
    };
    var message = Message.create(Message.LIST, metadata);
    connection.send(message);
}

Handlers.prototype.handlers[Message.JOIN] = function(connection, command) {
    var session = connection.session;
    var channel = Channels.getChannel(command.params.channel);
    channel.subscribe(session);
    // Return a list of online sessions in the channel
    var metadata = {
        channel: channel.id,
        sessions: channel.sessions
    };
    var message = Message.create(Message.JOINED, metadata);
    session.send(message, metadata);
}

Handlers.prototype.handlers[Message.LEAVE] = function(connection, command) {
    var session = connection.session;
    var channel = Channels.getChannel(command.params.channel);
    channel.unsubscribe(session);
}

Handlers.prototype.handlers[Message.CREATE] = function(connection, command) {
    var session = connection.session;
    var channel = Channels.createChannel(session, command.params);
    channel.subscribe(session);
    var metadata = {
        request: command.params.request,
        channel: channel.id,
        info: channel.info,
    }
    var message = Message.create(Message.CREATED, metadata);
    session.send(message, metadata);
}

