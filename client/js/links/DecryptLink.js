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
import { api, decrypt, encrypt } from 'util';

const TEST_MESSAGE = 'No one would have believed in the last years of the nineteenth century that this world was being' +
  ' watched keenly and closely by intelligences greater than man\'s and yet as mortal as his own; that as men busied' +
  ' themselves about their various concerns they were scrutinised and studied, perhaps almost as narrowly as a man' +
  ' with a microscope might scrutinise the transient creatures that swarm and multiply in a drop of water.';

let socket = Symbol();
let token = Symbol();
let test = Symbol();

export class DecryptLink extends Link {
  constructor(io) {
    this[socket] = io;
  }
  dispatch(action) {
    switch(action.type) {
      case actions.LOGIN_SUCCEEDED:
        this[token] = action.token;
        api({
          method: 'get',
          endpoint: 'test',
          content: {
            token: this[token]
          }
        }, (status, response) => {
          if (status == 404) {
            dispatch({
              type: actions.DECRYPTION_PASSWORD_NEEDED
            });
          } else if (status == 200) {
            try {
              this[test] = JSON.parse(response);
              dispatch({
                type: actions.DECRYPTION_PASSWORD_EXISTS
              });
            } catch(e) {
              dispatch({
                type: actions.DECRYPTION_FAILED,
                error: 'Server Error'
              });
            }
          } else {
            dispatch({
              type: actions.DECRYPTION_FAILED,
              error: 'Server Error'
            });
          }
        });
        break;
      case actions.DECRYPTION_PASSWORD_SUBMITTED:
        let decrypted = decrypt(this[test].message, action.password, this[test].salt);
        if (decrypted === TEST_MESSAGE) {
          dispatch({
            type: actions.DECRYPTION_SUCCEEDED,
            password: action.password
          });
        } else {
          dispatch({
            type: actions.DECRYPTION_FAILED,
            error: 'Invalid decryption password'
          });
        }
        break;
      case actions.DECRYPTION_PASSWORD_PAIR_SUBMITTED:
        if (action.password1 !== action.password2) {
          dispatch({
            type: actions.DECRYPTION_FAILED,
            error: 'Passwords do not match'
          });
        } else if (!action.password1) {
          dispatch({
            type: actions.DECRYPTION_FAILED,
            error: 'Passwords must not be empty'
          });
        } else {
          let encrypted = encrypt(TEST_MESSAGE, action.password1);
          api({
            method: 'post',
            endpoint: 'test',
            content: {
              salt: encrypted.salt,
              message: encrypted.message,
              token: this[token]
            }
          }, (status) => {
            if (status != 200) {
              dispatch({
                type: actions.DECRYPTION_FAILED,
                error: 'Server Error'
              });
            } else {
              dispatch({
                type: actions.DECRYPTION_SUCCEEDED,
                password: action.password1
              });
            }
          });
        }
        break;
    }
  }
}
