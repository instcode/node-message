var Map = require('./collection');
var Messages = require('./service/messages');

/**
 * @id {string} id
 * @name {string} name
 * @creation {Object} creator, creation time..
 * @options {Object} type, permissions...
 */
Channel = function(id, name, creation, options) {
    this.id = id;
    this.name = name;
    this.creation = creation;
    this.options = options;
    this.sessions = new Map();
}

module.exports = Channel;

/**
 * Add the given session to the conversation
 * @session {Session} session
 *
 * @return false if the session was in the session list
 */
Channel.prototype.add = function(session) {
    var self = this;
    var metadata = {
        session: session,
        channel: self.id
    };
    var message = Messages.create(Messages.JOIN, metadata);
    this.send(message, metadata);
    this.sessions.add(session);
    return true;
}

/**
 * Remove the given session from the conversation
 * @session {Session} session
 *
 * @return false if the session isn't in the session list.
 */
Channel.prototype.remove = function(session) {
    this.sessions.remove(session);
    var self = this;
    var metadata = {
        session: session,
        channel: self.id
    };
    
    var message = Messages.create(Messages.LEAVE, metadata);
    this.send(message, metadata);
    return true;
}

/**
 * Check if the given session has been joined to the channel
 */
Channel.prototype.has = function(session) {
    return (this.sessions.lookup(session.id) !== undefined);
}

/**
 * Deliver the given message to all sessions excluding
 * the excluded session.
 * @message {Object} message
 * @metadata {Object} metadata (excluded session...)
 */
Channel.prototype.send = function(message, metadata) {
    this.sessions.forEach(function (session) {
        session.send(message, metadata);
    });
}

