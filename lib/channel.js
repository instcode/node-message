var Map = require('./collection');
var Message = require('./message');

/**
 * @type {int} type (ROOM or PRIVATE)
 * @id {string} id
 */
var Channel = function(type, id, info) {
    this.type = type;
    this.id = id;
    this.info = info;
    this.sessions = new Map();
}

Channel.Type = {
    ROOM: 0,
    PRIVATE: 1
}

Channel.Mode = {
    PUBLIC: 0,
    PRIVATE: 1
}

module.exports = Channel;

/**
 * Add the given session to the conversation
 * @session {Session} session
 *
 * @return false if the session was in the session list
 */
Channel.prototype.subscribe = function(session) {
    if (this.type == Channel.Type.ROOM) {
        this._notify(Message.JOIN, session);
    }
    return this.sessions.add(session);
}

/**
 * Remove the given session from the conversation
 * @session {Session} session
 *
 * @return false if the session isn't in the session list.
 */
Channel.prototype.unsubscribe = function(session) {
    if (this.type == Channel.Type.ROOM) {
        this._notify(Message.LEAVE, session);
    }
    return this.sessions.remove(session);
}

/**
 * Notify all users in this channel about the action
 */
Channel.prototype._notify = function(action, session) {
    var self = this;
    var metadata = {
        session: session,
        channel: self.id
    };
    var message = Message.create(action, metadata);
    this.publish(message, metadata);
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
Channel.prototype.publish = function(message, metadata) {
    this.sessions.forEach(function (session) {
        session.send(message, metadata);
    });
}

