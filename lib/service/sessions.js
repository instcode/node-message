var Message = require('../message');
var Session = require('../session');
var Presence = Session.Presence;
var SessionManager = require('../manager/session_manager');

Sessions = function() {
    this.sessionManager = new SessionManager();
}

module.exports = new Sessions();

/**
 * Presence service
 */
var Presences = {
    /**
     * Handle status changed event of the given session
     */
    statusChanged: function(session) {
        var metadata = {
            session: session,
            status: session.status
        };
        var message = Message.create(Message.PRESENCE, metadata);

        // Send to him/her
        if (session.status !== Presence.OFFLINE) {
            session.send(message, metadata);
        }

        // Send to his/her buddy list
        module.exports.sessionManager.apply(metadata.session.buddylist, function(session) {
            // If the buddy is online, send this status update to him/her
            if (session !== undefined && session.status !== Presence.OFFLINE) {
                session.send(message, metadata);
            }
        });
    }
}

Sessions.prototype.createSession = function(id) {
    // FIXME Should load from the session storage instead
    var session = new Session(id, id);
    // Add all listeners
    session.on('status', Presences.statusChanged);
    this.sessionManager.add(session);
    return session;
}

Sessions.prototype.getSession = function(id) {
    var session = this.sessionManager.lookup(id);
    if (session === undefined) {
        session = this.createSession(id);
    }
    return session;
}

Sessions.prototype.authSession = function(id, token) {
    var session = this.getSession(id);
    // Verify if the token is correct
    return session;
}

Sessions.prototype.getPublicInfo = function(session) {
    return {
        name: session.name,
        status: session.status
    };
}

Sessions.prototype.getBuddyList = function(session) {
    var self = this;
    return this.sessionManager.select(session.buddylist, function(id, buddy) {
        if (buddy === undefined) {
            buddy = self.createSession(id);
        }
        return {id: buddy.id, name: buddy.name, status: buddy.status};
    });
}

Sessions.prototype.getMessages = function(session) {
    return [{from: "system", timestamp: Date.now(), msg: "Hi " + session.name + "! How are you today?"}];
}

