var Command = require('./command');
var Message = require('./message');
var Presence = require('./session').Presence;
var Sessions = require('./service/sessions');
var Channels = require('./service/channels');

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
 *
 * Security issue: Check if the authentication token is valid.
 */
Handlers.prototype.handlers[Command.CONNECT] = function(connection, command) {
    var id = command.params.username;
    var token = command.params.token;
    var status = command.params.status;
    var session = Sessions.authSession(id, token);

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

    var metadata = {
        error: 0,
        timestamp: Date.now(),
        info: Sessions.getPublicInfo(session),
        contacts: Sessions.getBuddyList(session),
        messages: Sessions.getMessages(session)
    };
    var message = Message.create(Message.CONNECT, metadata);
    connection.send(message);

    // Update the presence of the given session
    session.changeStatus((status === undefined) ? Presence.ONLINE : status);
}

/**
 * Send a message
 *
 * Security issue: Make sure the given session is allowed to send a
 * message to the given channel (in the channel? listener only?).
 * Should also check if the receivers are blocking this user or not
 * (in their blacklists).
 */
Handlers.prototype.handlers[Command.MESSAGE] = function(connection, command) {
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

    var channel = Channels.verifyChannel(command.params.channel);
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

/**
 * List all public rooms
 *
 * Security issue: No significant issue.
 */
Handlers.prototype.handlers[Command.LIST] = function(connection, command) {
    var session = connection.session;
    var channels = Channels.getChannels(session);
    var metadata = {
        channels: channels
    };
    var message = Message.create(Message.LIST, metadata);
    connection.send(message);
}

/**
 * Join a room
 *
 * Security issue: Make sure the given session is allowed to join the
 * given channel. Check if he is already in the channel is a bonus.
 */
Handlers.prototype.handlers[Command.JOIN] = function(connection, command) {
    var session = connection.session;
    var channel = Channels.verifyChannel(command.params.channel);
    channel.subscribe(session);
    // Return a list of online sessions in the channel
    var metadata = {
        channel: channel.id,
        sessions: channel.sessions
    };
    var message = Message.create(Message.JOINED, metadata);
    session.send(message, metadata);
}

/**
 * Leave a room
 *
 * Security issue: Make sure the given session is in the channel.
 */
Handlers.prototype.handlers[Command.LEAVE] = function(connection, command) {
    var session = connection.session;
    var channel = Channels.verifyChannel(command.params.channel);
    channel.unsubscribe(session);
}

/**
 * Create a room
 *
 * Security issue: Make sure the given session is allowed to create a
 * new channel.
 */
Handlers.prototype.handlers[Command.CREATE] = function(connection, command) {
    var session = connection.session;
    var channel = Channels.createChannel(session, command.params);
    channel.subscribe(session);
    var metadata = {
        channel: channel.id,
        info: channel.info,
    }
    var message = Message.create(Message.CREATED, metadata);
    session.send(message, metadata);
}

/**
 * Modify a room's data
 *
 * Security issue: Make sure the given session has permission to modify
 * the given channel. Only *system* account is able to modify any room.
 */
Handlers.prototype.handlers[Command.MODIFY] = function(connection, command) {
    var session = connection.session;
    var channel = Channels.verifyChannel(command.params.channel);
    channel.modifyChannel(command.params.options);
    // Send the update to all the current sessions in the channel
    var metadata = {
        channel: channel.id,
        options: command.params.options
    };
    var message = Message.create(Message.MODIFY, metadata);
    session.send(message, metadata);
}
