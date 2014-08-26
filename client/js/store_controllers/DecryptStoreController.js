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

export class DecryptStoreController extends StoreController {

  trigger(event) {
    switch(event.type) {
      case events.DECRYPTION_PASSWORD_SUBMITTED:
        router.route('chat', {
          token: this[token],
          password: event.password
        });
        break;
      case events.DECRYPTION_PASSWORD_PAIR_SUBMITTED:
        if (event.password1 !== event.password2) {
          this[error] = 'Passwords do not match';
          aggregator.update();
        } else if (!event.password1) {
          this[error] = 'Passwords must not be empty';
          aggregator.update();
        } else {

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
      } else {
        this[type] = 'existing';
        this[test] = response;
      }
      aggregator.update();
    });
    aggregator.update();
  }
}
