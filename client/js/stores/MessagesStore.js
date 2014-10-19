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

import { Store, aggregate, getGlobalData } from 'flvx';
import { actions } from 'actions';

let titleChange = Symbol();
let messages = Symbol();
let error = Symbol();
let lockedToBottom = Symbol();

export class MessagesStore extends Store {

  dispatch(action) {
    switch(action.type) {
      case actions.RECEIVED_MESSAGE_BLOCK:
        let oldMessages = this[messages];
        let newMessages = action.messages;
        if (!oldMessages || oldMessages.length != newMessages.length) {
          let lastOldMessage = oldMessages[0];
          let lastNewMessage = newMessages[0];
          if (!lastOldMessage || lastOldMessage.message != lastNewMessage.message ||
            lastOldMessage.name != lastNewMessage.name ||
            lastOldMessage.time != lastNewMessage.time ||
            lastOldMessage.isUser != lastNewMessage.isUser
          ) {
            this[messages] = action.messages;
            aggregate();
          }
        }
        break;
      case actions.ERROR_FETCHING_MESSAGE_BLOCK:
        this[error] = 'Could not fetch messages from server';
        aggregate();
        break;
      case actions.RECEIVED_NEW_MESSAGE:
        this[messages].unshift(action.message);
        if (getGlobalData().admin) {
          if (this[titleChange]) {
            clearTimeout(this[titleChange]);
          }
          document.title = 'New Message';
          this[titleChange] = setTimeout(() => {
            this[titleChange] = null;
            document.title = 'SChat';
          }, 2000);
        }
        aggregate();
        break;
    }
  }

  render() {
    return {
      messages: this[messages],
      error: this[error],
      lockedToBottom: this[lockedToBottom]
    };
  }

  onConnected() {
    this[messages] = [];
    this[lockedToBottom] = true;
    aggregate();
  }
}
