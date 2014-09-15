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

var messages = {
  AUTH: 'AUTH',
  AUTH_RESPONSE: 'AUTH_RESPONSE',
  LOGOUT: 'LOGOUT',
  LOGOUT_RESPONSE: 'LOGOUT_RESPONSE',
  CHANGE_PASSWORD: 'CHANGE_PASSWORD',
  CHANGE_PASSWORD_RESPONSE: 'CHANGE_PASSWORD_RESPONSE',

  GET_TEST: 'GET_TEST',
  GET_TEST_RESPONSE: 'GET_TEST_RESPONSE',
  SET_TEST: 'SET_TEST',
  SET_TEST_RESPONSE: 'SET_TEST_RESPONSE',

  GET_MESSAGE_BLOCK: 'GET_MESSAGE_BLOCK',
  GET_MESSAGE_BLOCK_RESPONSE: 'GET_MESSAGE_BLOCK_RESPONSE',
  NEW_MESSAGE: 'NEW_MESSAGE',
  SUBMIT_NEW_MESSAGE: 'SUBMIT_NEW_MESSAGE'
};

if (typeof module != 'undefined') {
  module.exports = messages;
} else {
  define(function() {
    return messages;
  });
}
