/**
 * This is a special map (associative array) data structure that contains
 * a map of items with their 'id'.
 */
Map = function() {
    this.items = {};
}

module.exports = Map;

/**
 * Add the given item to the map
 * @item {Object} item
 */
Map.prototype.add = function(item) {
    this.items[item.id] = item;
}

/**
 * Look up for an existing item from the given id
 */
Map.prototype.lookup = function(id) {
    return this.items[id];
}

/**
 * Remove the given item from the map
 * @item {Object} item
 */
Map.prototype.remove = function(item) {
    delete this.items[item.id];
}

/**
 * Iterate through all the items and apply the callback
 * for each one.
 * @callback {function} callback function
 */
Map.prototype.forEach = function(callback) {
    for (var id in this.items) {
        callback(this.items[id]);
    }
}

/**
 * Return item's ids.
 */
Map.prototype.keys = function(callback) {
    return Object.keys(this.items);
}
