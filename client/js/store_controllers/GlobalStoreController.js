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

import { StoreController } from 'flvx';
import { actions } from 'actions';

let data = Symbol();

export class GlobalStoreController extends StoreController {

  dispatch(action) {
    switch(action.type) {
      case actions.SOCKET_CREATED:
        this[data].socket = action.socket;
        break;
      case actions.LOGIN_SUBMITTED:
        this[data].username = action.username;
        break;
      case actions.LOGIN_SUCCEEDED:
        this[data].token = action.token;
        this[data].extras = action.extras;
        break;
      case actions.DECRYPTION_SUCCEEDED:
        this[data].password = action.password;
        break;
    }
  }

  render() {
    return this[data];
  }

  onConnected() {
    this[data] = {};
  }
}
