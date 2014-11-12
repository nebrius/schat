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

let messages = Symbol();
let lockedToBottom = Symbol();
let userOnline = Symbol();
let otherName = Symbol();
let otherOnline = Symbol();
let otherTyping = Symbol();

export class MessagesStore extends Store {

  dispatch(action) {
    switch(action.type) {
      case actions.RECEIVED_UPDATE:
        if (action.messages.length) {
          this[lockedToBottom] = true;
          this[messages].unshift(...action.messages);
        }
        this[userOnline] = true;
        this[otherOnline] = action.otherOnline;
        this[otherName] = action.otherName;
        this[otherTyping] = action.otherTyping;
        aggregate();
        break;
      case actions.ERROR_FETCHING_UPDATE:
        this[userOnline] = false;
        aggregate();
        break;
    }
  }

  render() {
    let data = {
      messages: this[messages],
      lockedToBottom: this[lockedToBottom],
      userOnline: this[userOnline],
      otherName: this[otherName],
      otherOnline: this[otherOnline],
      otherTyping: this[otherTyping]
    };
    this[lockedToBottom] = false;
    return data;
  }

  onConnected() {
    this[messages] = [];
    this[lockedToBottom] = true;
    this[userOnline] = true;
    this[otherOnline] = false;
    aggregate();
  }
}
