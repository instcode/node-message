var Channel = require('../channel');
var ChannelManager = require('../manager/channel_manager');

_Channels_ = function() {
    this.channelManager = new ChannelManager();
}

_Channels_.CHANNEL_ID = 0;
_Channels_.PRIVATE_CHANNELS = {};

module.exports = new _Channels_();

_Channels_.prototype.getChannel = function(id) {
    var channel = this.channelManager.lookup(id);
    if (channel === undefined) {
        throw Error('No channel has id <' + id + '>');
    }
    return channel;
}

_Channels_.prototype.getChannels = function(session) {
    return this.channelManager.find(function(channel) {
        if (channel.type === Channel.ROOM && channel.info.mode === 'public') {
            return {id: channel.id, type: channel.type, name: channel.info.name};
        }
    });
}

_Channels_.prototype.changeChannel = function(session, params) {
}

_Channels_.prototype.createChannel = function(session, params) {
    var channel;
    switch (params.type) {
        case 'room':
            // FIXME Should validate the client data in params obj
            metadata = {
                creator: session.id,
                date: Date.now(),
                name: params.options.name,
                mode: params.options.mode,
                permission: params.options.permission
            };
            channel = new Channel(Channel.ROOM, _Channels_.CHANNEL_ID++, metadata);
            break;

        case 'private':
            var id = _Channels_.privateChannel(session.id, params.options.user);
            if (id == undefined) {
                id = _Channels_.privateChannel(params.options.user, session.id);
            }
            channel = this.channelManager.lookup(id);
            if (channel === undefined) {
                id = _Channels_.CHANNEL_ID++;
                channel = new Channel(Channel.PRIVATE, id, metadata);
                _Channels_.PRIVATE_CHANNELS[session.id][params.options.user] = id;
            }
            break;
    }

    this.channelManager.add(channel);
    return channel;
}

_Channels_.privateChannel = function(id1, id2) {
    var id;
    var channels = _Channels_.PRIVATE_CHANNELS[id1];
    if (channels !== undefined) {
        id = channels[id2];
    }
    else {
        _Channels_.PRIVATE_CHANNELS[id1] = {};
    }
    return id;
}
