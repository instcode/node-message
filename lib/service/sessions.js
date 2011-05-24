var Session = require('../session');
var SessionManager = require('../manager/session_manager');

_Sessions_ = function() {
    _Sessions_.self = this;
    this.sessionManager = new SessionManager();
}

module.exports = new _Sessions_();

_Sessions_.prototype.createSession = function(id) {
    // FIXME Should load from the session storage instead
    var session = new Session(id, id);
    // Cache this session
    this.sessionManager.add(session);
    return session;
}

_Sessions_.prototype.getSession = function(id, token) {
    var session = this.sessionManager.lookup(id);
    if (session === undefined) {
        session = _Sessions_.self.createSession(id);
    }
    return session;
}

_Sessions_.prototype.getBuddyList = function(session) {
    return this.sessionManager.select(session.buddylist, function(id, buddy) {
        if (buddy === undefined) {
            buddy = _Sessions_.self.createSession(id);
        }
        return {id: buddy.id, name: buddy.name, status: buddy.status};
    });
}

_Sessions_.prototype.getMessages = function(session) {
    return [{from: "system", timestamp: Date.now(), msg: "Hi " + session.name + "! How are you today?"}];
}

