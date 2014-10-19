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
import { post } from 'util';
import { actions } from 'actions';
import errors from 'shared/errors';

export class LoginLink extends Link {
  dispatch(action) {
    switch(action.type) {
      case actions.LOGIN_SUBMITTED:
        post('/api/login/', {
          username: action.username,
          password: action.password
        }, (err, msg) => {
          if (err) {
            dispatch({
              type: actions.LOGIN_FAILED,
              error: 'Connection error'
            });
          } else if (msg.success) {
            dispatch({
              type: actions.LOGIN_SUCCEEDED,
              token: msg.token,
              extras: msg.extras
            });
          } else {
            dispatch({
              type: actions.LOGIN_FAILED,
              error: msg.error == errors.UNAUTHORIZED ? 'Invalid username or password' : 'Server error'
            });
          }
        });
        break;
    }
  }
}
