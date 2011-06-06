/**
 * Message builder
 */
var Message = function() {
}

module.exports = new Message();

Message.prototype.__formats = {};

/**
 * Create (and format) a message using built-in templates. Please note
 * that the output message is used only for delivering information from
 * server to client.
 */
Message.prototype.create = function(type, metadata) {
    try {
        var message = this.__formats[type](type, metadata);
        return JSON.stringify(message);
    }
    catch (e) {
        console.log(e.stack);
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
module.exports.CONNECT = Message.CONNECT = 'connect';
Message.prototype.__formats[Message.CONNECT] = function(type, metadata) {
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
module.exports.PRESENCE = Message.PRESENCE = 'status';
Message.prototype.__formats[Message.PRESENCE] = function(type, metadata) {
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
module.exports.MESSAGE = Message.MESSAGE = 'message';
Message.prototype.__formats[Message.MESSAGE] = function(type, metadata) {
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
module.exports.JOIN = Message.JOIN = 'join';
Message.prototype.__formats[Message.JOIN] = function(type, metadata) {
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
module.exports.JOINED = Message.JOINED = 'joined';
Message.prototype.__formats[Message.JOINED] = function(type, metadata) {
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
 * See Message.JOIN
 */
module.exports.LEAVE = Message.LEAVE = 'leave';
Message.prototype.__formats[Message.LEAVE] = Message.prototype.__formats[Message.JOIN];

/**
 * The following fields in metadata are used:
 *      channels: list of channels with options. For example:
 *          [
 *              {id: "0", name: "Global", creator: "system", ...},
 *              {id: "1", name: "Hell", creator: "instcode", ...},
 *              {id: "2", name: "Paradise", creator: "none", ...}
 *          ]
 */
module.exports.LIST = Message.LIST = 'list';
Message.prototype.__formats[Message.LIST] = function(type, metadata) {
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
module.exports.CREATE = Message.CREATE = 'create';
Message.prototype.__formats[Message.CREATE] = function(type, metadata) {
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
 *      channel: channel is being received the message
 */
module.exports.CREATED = Message.CREATED = 'created';
Message.prototype.__formats[Message.CREATED] = function(type, metadata) {
    return {
        type: type,
        data: {
            request: metadata.request,
            channel: metadata.channel,
            info: metadata.info
        }
    };
}

/**
 * The following fields in metadata are used:
 *      session: the session is being updated
 *      channel: channel is being received the message
 *      options: the to be modified settings the channel
 */
module.exports.MODIFY = Message.MODIFY = 'modify';
Message.prototype.__formats[Message.MODIFY] = function(type, metadata) {
    return {
        type: type,
        data: {
            from: metadata.session.id,
            channel: metadata.channel,
            options: metadata.options
        }
    };
}

