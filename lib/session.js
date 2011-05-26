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
Session = function(id, name) {
    this.id = id;
    this.name = name;
    this.status = Presence.OFFLINE;
    // Support 2 concurrent connections
    this.connections = [null, null];
    this.queue = 0;
    // Extra data
    this.blacklist = {};
    this.buddylist = [];
}

module.exports = Session;
module.exports.Presence = Presence;

Session.prototype.attach = function(connection) {
    connection.session = this;
    var previous = this.connections[this.queue];
    this.connections[this.queue] = connection;
    this.queue = 1 - this.queue;
    return previous;
}

Session.prototype.detach = function(connection) {
    if (this.connections[this.queue] !== connection) {
        this.queue = 1 - this.queue;
    }
    this.connections[this.queue] = null;
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

