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
import { api } from 'util';
import { events } from 'events';

let token = Symbol();
let password = Symbol();

const MINUTES_IN_MILLIS = 1000 * 60;

export class ChatStoreController extends StoreController {

  trigger(event) {
    switch(event.type) {
      case events.LOGOUT_REQUESTED:
        api({
          method: 'post',
          endpoint: 'logout',
          content: {
            token: this[token]
          }
        }, (status, response) => {
          router.route('login', {
            token: this[token],
            password: event.password
          });
        });
        break;
    }
  }

  render() {
    return {
      messages: [{
        time: Date.now() - MINUTES_IN_MILLIS,
        isUser: false,
        name: 'Bob',
        message: 'you?'
      }, {
        time: Date.now() - MINUTES_IN_MILLIS * 2,
        isUser: false,
        name: 'Bob',
        message: 'No one would have believed in the last years of the nineteenth century that this world was being' +
          ' watched keenly and closely by intelligences greater than man\'s and yet as mortal as his own; that as men busied' +
          ' themselves about their various concerns they were scrutinised and studied, perhaps almost as narrowly as a man' +
          ' with a microscope might scrutinise the transient creatures that swarm and multiply in a drop of water.'
      }, {
        time: Date.now() - MINUTES_IN_MILLIS * 5,
        isUser: true,
        name: 'Alice',
        message: 'how are you?'
      }, {
        time: Date.now() - MINUTES_IN_MILLIS * 8,
        isUser: false,
        name: 'Bob',
        message: 'hello'
      }, {
        time: Date.now() - MINUTES_IN_MILLIS * 10,
        isUser: true,
        name: 'Alice',
        message: 'No one would have believed in the last years of the nineteenth century that this world was being' +
          ' watched keenly and closely by intelligences greater than man\'s and yet as mortal as his own; that as men busied' +
          ' themselves about their various concerns they were scrutinised and studied, perhaps almost as narrowly as a man' +
          ' with a microscope might scrutinise the transient creatures that swarm and multiply in a drop of water.'
      }]
    };
  }

  onConnected(data) {
    this[password] = data.password;
    this[token] = data.token;
    aggregator.update();
    api({
      method: 'get',
      endpoint: 'messages',
      content: {
        start: 0,
        count: 100,
        password: this[password],
        token: this[token]
      }
    }, (status, response) => {
      debugger;
    });
  }

}
