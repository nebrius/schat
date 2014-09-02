/*
The MIT License (MIT)

Copyright (c) 2014 Bryan Hughes <bryan@theoreticalideations.com> (http://theoreticalideations.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

import { StoreController, aggregator } from 'flvx';
import { events } from 'events';
import io from 'socketio';

let token = Symbol();
let password = Symbol();
let username = Symbol();
let messages = Symbol();
let socket = Symbol();
let userConnected = Symbol();

const MESSAGE_WINDOW_SIZE = 100;

export class MessagesStore extends StoreController {

  trigger(event) {
    switch(event.type) {
      case events.MESSAGE_SUBMITTED:
        this[socket].emit('sendMessage', {
          token: this[token]
        });
        break;
    }
  }

  render() {
    return {
      messages: this[messages],
      userConnected: this[userConnected]
    };
  }

  onConnected(data) {
    this[token] = data.token;
    this[username] = data.username;
    this[password] = data.password;
    this[messages] = [];

    this[socket] = io(window.location.host);
    this[socket].emit('getMessages', {
      token: this[token],
      start: 0,
      count: MESSAGE_WINDOW_SIZE
    });
    this[socket].on('messages', (msg) => {
      this[messages] = msg;
      aggregator.update();
    });
    this[socket].on('newMessage', (msg) => {
      this[messages].shift(msg);
      if (this[messages].length > MESSAGE_WINDOW_SIZE) {
        this[messages].pop();
      }
      aggregator.update();
    });
    this[socket].on('userConnected', () => {
      this[userConnected] = true;
      aggregator.update();
    });
    this[socket].on('userDisconnected', () => {
      this[userConnected] = false;
      aggregator.update();
    });
    this[socket].on('err', (msg) => {
      debugger;
    });
  }
}
