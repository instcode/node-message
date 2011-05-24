var Map = require('../collection');

/**
 * Channel Manager
 */
ChannelManager = function() {
    Map.call(this);
}

module.exports = ChannelManager;

ChannelManager.prototype = new Map();

/**
 * Add the given channel to the manager
 * @channel {Channel} channel
 */
ChannelManager.prototype.add = function(channel) {
    Map.prototype.add.apply(this, arguments);
}

/**
 * Remove the given channel from the channel list
 * @channel {Channel} channel to be removed
 */
ChannelManager.prototype.remove = function(channel) {
    Map.prototype.remove.apply(this, arguments);
}

/**
 * Find all the channels that go through the filter
 * @filter {function} filter function
 */
ChannelManager.prototype.find = function(filter) {
    var founds = [];
    this.forEach(function (channel) {
        var value = filter(channel);
        if (value !== undefined) {
            founds.push(value);
        }
    });
    return founds;
}

