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

import { Link, dispatch } from 'flvx';
import { actions } from 'actions';
import { encrypt, decrypt } from 'util';
import messages from 'shared/messages';

let socket = Symbol();
let token = Symbol();
let username = Symbol();
let password = Symbol();
let initSocket = Symbol();

const MESSAGE_WINDOW_SIZE = 100;

export class ChatLink extends Link {
  constructor(io) {
    this[socket] = io;
  }
  dispatch(action) {
    switch(action.type) {
      case actions.LOGIN_SUBMITTED:
        this[username] = action.username;
        break;
      case actions.LOGIN_SUCCEEDED:
        this[token] = action.token;
        this[initSocket]();
        break;
      case actions.DECRYPTION_SUCCEEDED:
        this[password] = action.password;
        break;
      case actions.ROUTED:
        if (action.route == 'chat') {
          this[socket].emit(messages.GET_MESSAGE_BLOCK, {
            token: this[token],
            start: 0,
            count: MESSAGE_WINDOW_SIZE
          });
        }
        break;
      case actions.LOGOUT_REQUESTED:
        this[socket].emit(messages.LOGOUT, {
          token: this[token]
        });
        break;
      case actions.MESSAGE_SUBMITTED:
        let { salt: salt, message: message } = encrypt(action.message, this[password]);
        this[socket].emit(messages.SUBMIT_NEW_MESSAGE, {
          token: this[token],
          salt: salt,
          message: message
        });
    }
  }
  [initSocket]() {

    let decryptMessage = (msg) => {
      msg.isUser = msg.name == this[username];
      msg.message = decrypt(msg.message, this[password], msg.salt);
      delete msg.salt;
      return msg;
    };

    this[socket].on(messages.LOGOUT_RESPONSE, (msg) => {
      if (msg.success) {
        dispatch({
          type: actions.LOGOUT_SUCCEEDED
        });
      } else {
        dispatch({
          type: actions.LOGOUT_FAILED,
          error: 'Server Error'
        });
      }
    });

    this[socket].on(messages.GET_MESSAGE_BLOCK_RESPONSE, (msg) => {
      if (msg.success) {
        dispatch({
          type: actions.RECEIVED_MESSAGE_BLOCK,
          messages: msg.messages.map(decryptMessage)
        });
      } else {
        dispatch({
          type: actions.ERROR_FETCHING_MESSAGE_BLOCK
        });
      }
    });

    this[socket].on(messages.NEW_MESSAGE, (msg) => {
      dispatch({
        type: actions.RECEIVED_NEW_MESSAGE,
        message: decryptMessage(msg)
      });
    });
  }
}
