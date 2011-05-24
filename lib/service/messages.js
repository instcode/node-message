/**
 * Messages Builder
 */
var _Messages_ = function() {
}

module.exports = new _Messages_();

_Messages_.prototype.__formats = {};

/**
 * Create (and format) a message using built-in templates. Please note
 * that the output message is used only for delivering information from
 * server to client.
 */
_Messages_.prototype.create = function(type, metadata) {
    try {
        var message = this.__formats[type](type, metadata);
        return JSON.stringify(message);
    }
    catch (e) {
        console.log(e);
    }
    return '';
}

/**
 * The following fields in metadata are used:
 *      error: success (0) or error (any number) code
 *      timestamp: current server time
 *      contacts: buddy list
 *      messages: offline messages or system messages
 */
module.exports.CONNECT = _Messages_.CONNECT = 'connect';
_Messages_.prototype.__formats[_Messages_.CONNECT] = function(type, metadata) {
    return {
        type: type,
        data: {
            error: metadata.error,
            timestamp: metadata.timestamp,
            contacts: metadata.contacts,
            messages: metadata.messages,
        }
    };
}

/**
 * The following fields in metadata are used:
 *      session: the session is being updated
 *      status: online status of the session
 */
module.exports.STATUS = _Messages_.STATUS = 'status';
_Messages_.prototype.__formats[_Messages_.STATUS] = function(type, metadata) {
    return {
        type: type,
        data: {
            from: metadata.session.id,
            status: metadata.status
        }
    };
}

/**
 * The following fields in metadata are used:
 *      session: the session is being updated
 *      channel: channel is being received the message
 *      message: message to be delivered
 */
module.exports.MESSAGE = _Messages_.MESSAGE = 'message';
_Messages_.prototype.__formats[_Messages_.MESSAGE] = function(type, metadata) {
    return {
        type: type,
        data: {
            from: metadata.session.id,
            channel: metadata.channel,
            timestamp: metadata.timestamp,
            msg: metadata.message
        }
    };
}

/**
 * The following fields in metadata are used:
 *      session: the session is being updated
 *      channel: channel is being received the message
 */
module.exports.JOIN = _Messages_.JOIN = 'join';
_Messages_.prototype.__formats[_Messages_.JOIN] = function(type, metadata) {
    return {
        type: type,
        data: {
            from: metadata.session.id,
            channel: metadata.channel,
        }
    };
}

/**
 * The following fields in metadata are used:
 *      channel: channel is being received the message
 *      sessions: all users are in the given channel
 */
module.exports.JOINED = _Messages_.JOINED = 'joined';
_Messages_.prototype.__formats[_Messages_.JOINED] = function(type, metadata) {
    return {
        type: type,
        data: {
            channel: metadata.channel,
            sessions: metadata.sessions.keys(),
        }
    };
}

/**
 * The following fields in metadata are used:
 *      session: the session is being updated
 *      channel: channel is being received the message
 * See _Messages_.JOIN
 */
module.exports.LEAVE = _Messages_.LEAVE = 'leave';
_Messages_.prototype.__formats[_Messages_.LEAVE] = _Messages_.prototype.__formats[_Messages_.JOIN];

/**
 * The following fields in metadata are used:
 *      channels: list of channels with options. For example:
 *          [
 *              {id: "global", name: "Global", creator: "system", ...},
 *              {id: "hell", name: "Hell", creator: "instcode", ...},
 *              {id: "paradise", name: "Paradise", creator: "none", ...}
 *          ]
 */
module.exports.LIST = _Messages_.LIST = 'list';
_Messages_.prototype.__formats[_Messages_.LIST] = function(type, metadata) {
    return {
        type: type,
        data: {
            channels: metadata.channels
        }
    };
}

/**
 * The following fields in metadata are used:
 *      session: the session is being updated
 *      channel: channel is being received the message
 *      message: initial message to be sent when creating the channel
 *      options: the settings of the being created channel
 */
module.exports.CREATE = _Messages_.CREATE = 'create';
_Messages_.prototype.__formats[_Messages_.CREATE] = function(type, metadata) {
    return {
        type: type,
        data: {
            from: metadata.session.id,
            channel: metadata.channel,
            msg: metadata.message,
            options: metadata.options
        }
    };
}

/**
 * The following fields in metadata are used:
 *      session: the session is being updated
 *      channel: channel is being received the message
 *      options: the to be modified settings the channel
 */
module.exports.UPDATE = _Messages_.UPDATE = 'update';
_Messages_.prototype.__formats[_Messages_.UPDATE] = function(type, metadata) {
    return {
        type: type,
        data: {
            from: metadata.session.id,
            channel: metadata.channel,
            options: metadata.options
        }
    };
}

/**
 * The following fields in metadata are used:
 *      session: the session is being updated
 *      channel: channel is being received the message
 *      message: a reason why the channel was deleted
 */
module.exports.DELETE = _Messages_.DELETE = 'delete';
_Messages_.prototype.__formats[_Messages_.DELETE] = function(type, metadata) {
    return {
        type: type,
        data: {
            from: metadata.session.id,
            channel: metadata.channel,
            reason: metadata.message
        }
    };
}

