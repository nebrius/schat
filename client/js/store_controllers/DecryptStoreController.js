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

let token = Symbol();
let loading = Symbol();
let cipherCheck = Symbol();
let error = Symbol();

export class DecryptStoreController extends StoreController {

  trigger(event) {
  }

  render() {
    return {
      loading: this[loading],
      error: this[error]
    };
  }

  onConnected(data) {
    this[loading] = true;
    this[token] = data.token;

    aggregator.update();

    let xhr = new XMLHttpRequest();
    xhr.onload = () => {
      switch(xhr.status) {
        case 401:
          router.route('login', { error: 'Expired session. Please login again.' });
          break;
        case 200:
          this[loading] = false;
          this[cipherCheck] = xhr.responseText;
          aggregator.update();
          break;
        default:
          this[error] = 'Server Error';
          aggregator.update();
          break;
      }
    };
    xhr.open('get', '/api/cipher_check?token=' + this[token], true);
    xhr.send();
  }

}
