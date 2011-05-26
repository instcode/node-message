var Session = require('../session');
var SessionManager = require('../manager/session_manager');

Sessions = function() {
    this.sessionManager = new SessionManager();
}

module.exports = new Sessions();

Sessions.prototype.createSession = function(id) {
    // FIXME Should load from the session storage instead
    var session = new Session(id, id);
    this.sessionManager.add(session);
    return session;
}

Sessions.prototype.getSession = function(id) {
    var session = this.sessionManager.lookup(id);
    if (session === undefined) {
        session = Sessions.self.createSession(id);
    }
    return session;
}

Sessions.prototype.authSession = function(id, token) {
    var session = this.getSession(id);
    // Verify if the token is correct
    return session;
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

