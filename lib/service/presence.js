var Messages = require('./messages');
var Sessions = require('./sessions');

/**
 * Presence service
 */
Presence = function() {
}

module.exports = Presence;

Presence.OFFLINE = 0;
Presence.ONLINE = 1;
Presence.INVISIBLE = 2;

Presence.changeStatus = function(metadata) {
    if (metadata.status == undefined) {
        metadata.status = Presence.ONLINE;
    }
    var status = metadata.status;
    var session = metadata.session;
    if (session.status != status) {
        session.status = status;

        var message = Messages.create(Messages.STATUS, metadata);
        // Send to his/her
        if (status !== Presence.OFFLINE) {
            session.send(message, metadata);
        }
        
        // Send to his/her buddy list
        Sessions.sessionManager.apply(metadata.session.buddylist, function(session) {
            if (session !== undefined && session.status !== Presence.OFFLINE) {
                session.send(message, metadata);
            }
        });
    }
}

