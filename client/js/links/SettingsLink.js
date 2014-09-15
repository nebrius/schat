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
import errors from 'shared/errors';
import messages from 'shared/messages';

let socket = Symbol();
let token = Symbol();

export class SettingsLink extends Link {
  constructor(io) {
    this[socket] = io;
  }
  dispatch(action) {
    switch(action.type) {
      case actions.LOGIN_SUCCEEDED:
        this[token] = action.token;
        break;
      case actions.CHANGE_PASSWORD_REQUESTED:
        if (action.newPassword1 != action.newPassword2) {
          dispatch({
            type: actions.CHANGE_PASSWORD_FAILED,
            error: 'Passwords do not match'
          });
        } else if (!action.newPassword1) {
          dispatch({
            type: actions.CHANGE_PASSWORD_FAILED,
            error: 'New password must not be empty'
          });
        } else {
          this[socket].emit(messages.CHANGE_PASSWORD, {
            token: this[token],
            oldPassword: action.currentPassword,
            newPassword: action.newPassword1
          });
        }
        break;
    }
  }
  onConnected() {
    this[socket].on(messages.AUTH_RESPONSE, (msg) => {
      if (msg.success) {
        dispatch({
          type: actions.LOGIN_SUCCEEDED,
          token: msg.token
        });
      } else {
        dispatch({
          type: actions.LOGIN_FAILED,
          error: msg.error == errors.UNAUTHORIZED ? 'Invalid username or password' : 'Server error'
        });
      }
    });
  }
}