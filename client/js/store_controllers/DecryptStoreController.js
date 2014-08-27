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

import { StoreController, aggregator, router } from 'flvx';
import { api } from 'util/api';
import { events } from 'events';

let token = Symbol();
let error = Symbol();
let type = Symbol();
let test = Symbol();

const SALT_LENGTH = 128 / 8;
const HASH_LENGTH = 512 / 32;
const ITERATIONS = 25;
const TEST_MESSAGE = 'No one would have believed in the last years of the nineteenth century that this world was being' +
  ' watched keenly and closely by intelligences greater than man\'s and yet as mortal as his own; that as men busied' +
  ' themselves about their various concerns they were scrutinised and studied, perhaps almost as narrowly as a man' +
  ' with a microscope might scrutinise the transient creatures that swarm and multiply in a drop of water.';

export class DecryptStoreController extends StoreController {

  trigger(event) {
    switch(event.type) {
      case events.DECRYPTION_PASSWORD_SUBMITTED:
        let salt = this[test].salt;
        let message = this[test].message;
        let hash = CryptoJS.PBKDF2(event.password, salt, {
            keySize: HASH_LENGTH,
            iterations: ITERATIONS
          }).toString();
        message = message.replace(/ /g, '+');
        let decrypted = CryptoJS.enc.Latin1.stringify(CryptoJS.AES.decrypt(message, hash));
        if (decrypted === TEST_MESSAGE) {
          router.route('chat', {
            token: this[token],
            password: event.password
          });
        } else {
          this[error] = 'Invalid decryption password';
          aggregator.update();
        }
        break;
      case events.DECRYPTION_PASSWORD_PAIR_SUBMITTED:
        if (event.password1 !== event.password2) {
          this[error] = 'Passwords do not match';
          aggregator.update();
        } else if (!event.password1) {
          this[error] = 'Passwords must not be empty';
          aggregator.update();
        } else {
          let salt = CryptoJS.lib.WordArray.random(SALT_LENGTH).toString();
          let hash = CryptoJS.PBKDF2(event.password1, salt, {
            keySize: HASH_LENGTH,
            iterations: ITERATIONS
          }).toString();
          let encrypted = CryptoJS.AES.encrypt(TEST_MESSAGE, hash);
          console.log(encrypted.toString());
          api({
            method: 'post',
            endpoint: 'test',
            content: {
              salt: salt,
              message: encrypted,
              token: this[token]
            }
          }, (status) => {
            if (status != 200) {
              this[error] = 'Internal server error';
              aggregator.update();
            } else {
              router.route('chat', {
                token: this[token],
                password: event.password1
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
      aggregator.update();
    });
    aggregator.update();
  }
}
