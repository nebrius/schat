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

import { aggregator } from 'flvx';
import { router } from 'flvx';
import { events } from 'events';

const STATE_IDLE = 0;
const STATE_FAILED = 1;

export class LoginStore {

  trigger(event) {
    switch(event.type) {
      case events.LOGIN_SUBMITTED:
          if (event.username == 'user' && event.password == 'pass') {
            router.route('decrypt');
          } else {
            this.error = 'Invalid username and password';
            aggregator.update();
          }
        break;
    }
  }

  render() {
    return {
      loginError: this.error
    };
  }

  onConnected() {
    this.state = STATE_IDLE;
    aggregator.update();
  }

}
