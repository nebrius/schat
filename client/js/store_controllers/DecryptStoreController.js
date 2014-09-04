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

import { StoreController, aggregate, route } from 'flvx';
import { api, encrypt, decrypt } from 'util';
import { events } from 'events';

let token = Symbol();
let error = Symbol();
let type = Symbol();
let test = Symbol();

const TEST_MESSAGE = 'No one would have believed in the last years of the nineteenth century that this world was being' +
  ' watched keenly and closely by intelligences greater than man\'s and yet as mortal as his own; that as men busied' +
  ' themselves about their various concerns they were scrutinised and studied, perhaps almost as narrowly as a man' +
  ' with a microscope might scrutinise the transient creatures that swarm and multiply in a drop of water.';

export class DecryptStoreController extends StoreController {

  dispatch(action) {
    switch(action.type) {
      case events.DECRYPTION_PASSWORD_SUBMITTED:
        let decrypted = decrypt(this[test].message, action.password, this[test].salt);
        if (decrypted === TEST_MESSAGE) {
          route('chat', {
            token: this[token],
            password: action.password
          });
        } else {
          this[error] = 'Invalid decryption password';
          aggregate();
        }
        break;
      case events.DECRYPTION_PASSWORD_PAIR_SUBMITTED:
        if (action.password1 !== action.password2) {
          this[error] = 'Passwords do not match';
          aggregate();
        } else if (!action.password1) {
          this[error] = 'Passwords must not be empty';
          aggregate();
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
              this[error] = 'Internal server error';
              aggregate();
            } else {
              route('chat', {
                token: this[token],
                password: action.password1
              });
            }
          });
        }
        break;
    }
  }

  render() {
    return {
      type: this[type],
      error: this[error]
    };
  }

  onConnected(data) {
    this[token] = data.token;
    api({
      method: 'get',
      endpoint: 'test',
      content: {
        token: this[token]
      }
    }, (status, response) => {
      if (status == 404) {
        this[type] = 'new';
      } else if (status == 200) {
        try {
          this[test] = JSON.parse(response);
          this[type] = 'existing';
        } catch(e) {
          this[error] = 'Internal server error';
        }
      } else {
        this[error] = 'Internal server error';
      }
      aggregate();
    });
    aggregate();
  }
}
