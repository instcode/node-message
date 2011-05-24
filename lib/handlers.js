var Messages = require('./service/messages');
var Sessions = require('./service/sessions');
var Channels = require('./service/channels');
var Presence = require('./service/presence');

Handlers = function() {
    Handlers.self = this;
}

module.exports = Handlers;

Handlers.prototype.handle = function(connection, message) {
    try {
        command = JSON.parse(message);
        var handler = this.handlers[command.action];
        handler(connection, command);
    }
    catch (e) {
        // The client tried to fool us with a malformed message. In
        // this case, we punish the client by adding it to the black
        // list and force the connection closed. This is why we don't
        // trust any client!
        connection.reject(['malformed']);
        console.log(e.stack);
    }
}

Handlers.prototype.handlers = {};

/**
 * Handle authentication with id & token. The result will be sent directly to
 * the user on this requesting connection.
 */
Handlers.prototype.handlers[Messages.CONNECT] = function(connection, command) {
    var id = command.params.username;
    var token = command.params.token;
    var status = command.params.status;
    var session = connection.session;
    
    if (session === undefined) {
        session = Sessions.getSession(id, token);
        if (session === null) {
            var metadata = {error: 1, contacts: [], messages: []};
            var message = Messages.create(Messages.CONNECT, metadata);
            // Failed to retrieve the session
            connection.send(message);
            return;
        }

        // The system only supports a specific amount of concurrent connections.
        // When this number exceeds the limit, the system will drop out the *least
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
    var message = Messages.create(Messages.CONNECT, metadata);
    connection.send(message);
    
    // Update the presence of the given session and notify his/her buddy list
    metadata = {
        connection: connection,
        session: session,
        status: status
    };
    Presence.changeStatus(metadata);
}

Handlers.prototype.handlers[Messages.MESSAGE] = function(connection, command) {
    var session = connection.session;
    var channel = Channels.getChannel(command.params.channel);
    var metadata = {
        connection: connection,
        session: session,
        channel: command.params.channel,
        timestamp: Date.now(),
        message: command.params.msg
    };

    var message = Messages.create(Messages.MESSAGE, metadata);
    channel.send(message, metadata);
}

Handlers.prototype.handlers[Messages.LIST] = function(connection, command) {
    var session = connection.session;
    var channels = Channels.getChannels(session);
    var metadata = {
        channels: channels
    };
    var message = Messages.create(Messages.LIST, metadata);
    session.send(message, metadata);
}

Handlers.prototype.handlers[Messages.JOIN] = function(connection, command) {
    var session = connection.session;
    var channel = Channels.getChannel(command.params.channel);
    // Return a list of online sessions in the channel
    var metadata = {
        channel: channel.id,
        sessions: channel.sessions
    };
    var message = Messages.create(Messages.JOINED, metadata);
    session.send(message, metadata);
    
    channel.add(session);
}

Handlers.prototype.handlers[Messages.LEAVE] = function(connection, command) {
    var session = connection.session;
    var channel = Channels.getChannel(command.params.channel);
    channel.remove(session);
}

Handlers.prototype.handlers[Messages.CREATE] = function(connection, command) {
    var session = connection.session;
    var channel = Channels.createChannel(session, command.params);

    var metadata = {
        request: command.params.request,
        channel: channel.id,
        info: channel.info,
    }
    var message = Messages.create(Messages.CREATED, metadata);
    session.send(message, metadata);
}

