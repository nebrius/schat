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

import { Link, dispatch, getGlobalData } from 'flvx';
import { actions } from 'actions';
import { encrypt, decrypt, post, get } from 'util';

const MESSAGE_WINDOW_SIZE = 100;

let decryptMessage = (msg) => {
  let { username: username, password: password} = getGlobalData();
  msg.isUser = msg.name == username;
  msg.message = decrypt(msg.message, password, msg.salt);
  delete msg.salt;
  return msg;
}

export class ChatLink extends Link {
  dispatch(action) {;
    switch(action.type) {
      case actions.MESSAGE_SUBMITTED:
        let { salt: salt, message: message } = encrypt(action.message, getGlobalData().password);
        post('/api/messages/', {
          token: getGlobalData().token,
          salt: salt,
          message: message
        }, (err, msg) => {
          if (err) {
            dispatch({
              type: actions.MESSAGE_SUBMISSION_FAILED
            });
          } else {
            dispatch({
              type: actions.MESSAGE_SUBMISSION_SUCEEDED
            });
          }
        });
    }
  }
  onConnected() {
    var lastMessage;
    function update() {
      get('/api/update/', {
        token: getGlobalData().token,
        lastMessage: lastMessage
      }, (err, msg) => {
        if (err || !msg.success) {
          dispatch({
            type: actions.ERROR_FETCHING_UPDATE
          });
        } else if (msg.success) {
          if (msg.messages.length) {
            lastMessage = msg.messages[0].time;
          }
          dispatch({
            type: actions.RECEIVED_UPDATE,
            messages: msg.messages.map(decryptMessage),
            otherName: msg.otherName,
            otherOnline: msg.otherOnline
          });
        }
      });
    }
    var interval = setInterval(update, 2000);
    document.addEventListener('visibilitychange', () => {
      clearInterval(interval);
      if (document.visibilityState == 'visible') {
        interval = setInterval(update, 2000);
      } else {
        interval = setInterval(update, 120000);
      }
    });
    update();
  }
}
