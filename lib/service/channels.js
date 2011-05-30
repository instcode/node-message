var Channel = require('../channel');
var ChannelManager = require('../manager/channel_manager');
var Sessions = require('./sessions');

Channels = function() {
    this.channelManager = new ChannelManager();
}

Channels.CHANNEL_ID = 0;
Channels.PRIVATE_CHANNELS = {};

module.exports = new Channels();

Channels.prototype.getChannel = function(id) {
    var channel = this.channelManager.lookup(id);
    if (channel === undefined) {
        throw new Error('No channel has id <' + id + '>');
    }
    return channel;
}

Channels.prototype.getChannels = function(session) {
    return this.channelManager.find(function(channel) {
        if (channel.type === Channel.Type.ROOM && channel.info.mode === Channel.Mode.PUBLIC) {
            channel.info.count = channel.sessions.length;
            return {id: channel.id, type: channel.type, info: channel.info};
        }
    });
}

Channels.prototype.updateChannel = function(session, params) {
}

Channels.prototype.createChannel = function(session, params) {
    var self = this;
    var channel;
    switch (params.type) {
        case Channel.Type.ROOM:
            // FIXME Should validate the client data in params obj
            var metadata = {
                creator: session.id,
                date: Date.now(),
                name: params.options.name,
                mode: params.options.mode,
                permission: params.options.permission
            };
            var id = Channels.CHANNEL_ID++;
            channel = new Channel(Channel.Type.ROOM, id, metadata);
            break;

        case Channel.Type.PRIVATE:
            var from = session;
            var to = Sessions.getSession(params.options.user);
            channel = self.getPrivateChannel(from, to);
            break;
    }
    if (channel !== undefined) {
        this.channelManager.add(channel);
    }
    return channel;
}

Channels.prototype.getPrivateChannel = function(from, to) {
    var id = Channels.privateChannel(from.id, to.id);
    if (id === undefined) {
        id = Channels.privateChannel(to.id, from.id);
    }
    var channel;
    var self = this;
    try {
        channel = self.getChannel(id);
    }
    catch (e) {
        id = Channels.CHANNEL_ID++;
        channel = new Channel(Channel.Type.PRIVATE, id);
        Channels.PRIVATE_CHANNELS[from.id][to.id] = id;
    }
    channel.subscribe(to);
    return channel;
}

Channels.privateChannel = function(id1, id2) {
    var id;
    var channels = Channels.PRIVATE_CHANNELS[id1];
    if (channels !== undefined) {
        id = channels[id2];
    }
    else {
        Channels.PRIVATE_CHANNELS[id1] = {};
    }
    return id;
}

