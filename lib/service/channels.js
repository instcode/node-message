var Channel = require('../channel');
var ChannelManager = require('../manager/channel_manager');

_Channels_ = function() {
    this.channelManager = new ChannelManager();
}

module.exports = new _Channels_();

_Channels_.prototype.getChannel = function(id) {
    var channel = this.channelManager.lookup(id);
    if (channel === undefined) {
        throw Error('No channel has id <' + command.params.channel + '>');
    }
    return channel;
}

_Channels_.prototype.getChannels = function(session) {
    return this.channelManager.find(function(channel) {
        if (channel.options.type === 'room' && channel.options.mode === 'public') {
            return {id: channel.id, name: channel.name, type: channel.options.type};
        }
    });
}

_Channels_.prototype.createChannel = function(metadata) {
    var channel = new Channel(metadata.id, metadata.name, metadata.creation, metadata.options);
    this.channelManager.add(channel);
}

