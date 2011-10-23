# node-message

A node.js instant messaging library that makes use of [web-socket-server](http://github.com/miksago/node-websocket-server) and [web-socket-js](http://github.com/gimite/web-socket-js).

## Development Status

This module is being heavily developed by [instcode](http://github.com/instcode/node-message/commits/master?author=instcode).

## Usage

    var Handlers = require('handlers');
    var njms = NJMS.createServer(new Handlers());
    njms.listen(80, 'chat.puppycloud.com');

## API

### Handlers

A dispatching service which routes incoming messages (commands) from client to appropriate handlers.

### Channel

A communication area which involves multiple online sessions in.

### Session

A user data object which contains both offline data & live connections.

## Changelog

### v0.0.1

* Not released yet but when, it will be [here](https://github.com/instcode/node-message/commits/v0.0.1).

## License

MIT license

Copyright (C) 2011 Khoa Nguyen (instcode@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
