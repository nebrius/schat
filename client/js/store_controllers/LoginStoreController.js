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
import { events } from 'events';

let error = Symbol();

export class LoginStoreController extends StoreController {

  trigger(event) {
    switch(event.type) {
      case events.LOGIN_SUBMITTED:
        let xhr = new XMLHttpRequest();
        let data = 'username=' + event.username + '&password=' + event.password;
        xhr.onload = () => {
          switch(xhr.status) {
            case 401:
              this[error] = 'Invalid username or password';
              aggregator.update();
              break;
            case 200:
              router.route('decrypt', {
                token: xhr.responseText
              });
              break;
            default:
              this[error] = 'Server Error';
              aggregator.update();
              break;
          }
        };
        xhr.open('post', '/api/auth', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(data);
        break;
    }
  }

  render() {
    return {
      error: this[error]
    };
  }

  onConnected(data) {
    this[error] = data.error;
    aggregator.update();
  }

}
