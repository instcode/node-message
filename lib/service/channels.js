var Channel = require('../channel');
var ChannelManager = require('../manager/channel_manager');

Channels = function() {
    this.channelManager = new ChannelManager();
}

Channels.CHANNEL_ID = 0;
Channels.PRIVATE_CHANNELS = {};

module.exports = new Channels();

Channels.prototype.getChannel = function(id) {
    var channel = this.channelManager.lookup(id);
    if (channel === undefined) {
        throw Error('No channel has id <' + id + '>');
    }
    return channel;
}

Channels.prototype.getChannel = function(id) {
    var channel = this.channelManager.lookup(id);
    if (channel === undefined) {
        throw Error('No channel has id <' + id + '>');
    }
    return channel;
}

Channels.prototype.getChannels = function(session) {
    return this.channelManager.find(function(channel) {
        if (channel.type === Channel.ROOM && channel.info.mode === 'public') {
            return {id: channel.id, type: channel.type, name: channel.info.name};
        }
    });
}

Channels.prototype.updateChannel = function(session, params) {
}

Channels.prototype.createChannel = function(session, params) {
    var self = this;
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
            var id = Channels.CHANNEL_ID++;
            channel = new Channel(Channel.ROOM, id, metadata);
            break;

        case 'private':
            var from = session;
            var to = Sessions.getSession(params.options.user);
            channel = self.getPrivateChannel(from, to);
            break;
    }
    if (channel !== undefined) {
        this.channelManager.add(channel);
        channel.subscribe(session);
    }
    return channel;
}

Channels.prototype.getPrivateChannel = function(from, to) {
    var id = Channels.privateChannel(from.id, to.id);
    if (id === undefined) {
        id = Channels.privateChannel(to.id, from.id);
    }
    channel = this.getChannel(id);
    if (channel === undefined) {
        id = Channels.CHANNEL_ID++;
        channel = new Channel(Channel.PRIVATE, id, metadata);
        Channels.PRIVATE_CHANNELS[from.id][to.id] = id;
    }
    channel.subscribe(to);
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

Channels.prototype.send = function(from, to, message) {

}
