var Message = require('../message');
var Presence = require('../session').Presence;
var Sessions = require('./sessions');

/**
 * Presence service
 */
Presences = function() {
}

module.exports = new Presences();

Presences.prototype.changeStatus = function(metadata) {
    if (metadata.status == undefined) {
        metadata.status = Presence.ONLINE;
    }
    var status = metadata.status;
    var session = metadata.session;
    if (session.status != status) {
        session.status = status;

        var message = Message.create(Message.STATUS, metadata);
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

