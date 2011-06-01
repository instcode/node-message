var util = require("util");
var events = require('events');

/**
 * Presence
 */
var Presence = {
    ONLINE: 0,
    OFFLINE: 1
}

/**
 * Session
 */
var Session = function(id, name) {
    this.id = id;
    this.name = name;
    this.status = Presence.OFFLINE;
    // Support 2 concurrent connections
    this.connections = [null, null];
    this._queue = 0;
    // Extra data
    this.blacklist = {};
    this.buddylist = [];
    events.EventEmitter.call(this);
}

module.exports = Session;
module.exports.Presence = Presence;
util.inherits(Session, events.EventEmitter);

Session.prototype.changeStatus = function(status) {
    if (this.status !== status) {
        this.status = status;
        this.emit('status', this);
    }
}

Session.prototype.attach = function(connection) {
    connection.session = this;
    var previous = this.connections[this._queue];
    this.connections[this._queue] = connection;
    this._queue = 1 - this._queue;
    return previous;
}

Session.prototype.detach = function(connection) {
    if (this.connections[this._queue] !== connection) {
        this._queue = 1 - this._queue;
    }
    this.connections[this._queue] = null;
    // Notify all listener that the current session is closing if
    // there isn't connection left
    if (this.connections[1 - this._queue] == null) {
        this.emit('closed', this);
        this.changeStatus(Presence.OFFLINE);
    }
}

/**
 * Send the message to all connections associated with this session.
 * Rule: Don't forward the message if:
 *      1. It was initiated by someone in the blacklist.
 *      2. The receiver is using the same connection
 *
 * @metadata {object} data that helps the sending process to decide
 *      what to do. The following fields in the metadata will be
 *      considered:
 *          session: The one who initiated this sending
 *          connection: The connection who's sending.
 *
 */
Session.prototype.send = function(message, metadata) {
    if (metadata == undefined) {
        metadata = {};
    }
    if (metadata.session === undefined || !(metadata.session.id in this.blacklist)) {
        for (var i = 0; i < this.connections.length; i++) {
            var connection = this.connections[i];
            if (connection != metadata.connection && connection != null) {
                connection.send(message);
            }
        }
    }
}

