var Map = require('../collection');

/**
 * Session Manager
 */
SessionManager = function() {
    Map.call(this);
}

module.exports = SessionManager;

SessionManager.prototype = new Map();

/**
 * Select sessions from session list (by ids) by applying
 * callback on each session
 *
 * @sessions (object) list of sessions
 * @callback {function} callback function(id, session)
 *
 * @return a list of items returning from the callback
 */
SessionManager.prototype.select = function(sessions, callback) {
    var founds = [];
    for (var i = 0; i < sessions.length; i++) {
        var item = callback(sessions[i], this.lookup(sessions[i]));
        if (item !== null) {
            founds.push(item);
        }
    }
    return founds;
}

/**
 * Apply the callback to all the sessions by ids.
 *
 * @sessions (Array) list of sessions
 * @callback {function} callback function(session)
 */
SessionManager.prototype.apply = function(sessions, callback) {
    for (var i = 0; i < sessions.length; i++) {
        callback(this.lookup(sessions[i]));
    }
}

