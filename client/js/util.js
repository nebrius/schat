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

const SALT_LENGTH = 128 / 8;
const HASH_LENGTH = 512 / 32;
const ITERATIONS = 25;

export function encrypt(message, password) {
  let salt = CryptoJS.lib.WordArray.random(SALT_LENGTH).toString();
  let hash = CryptoJS.PBKDF2(password, salt, {
    keySize: HASH_LENGTH,
    iterations: ITERATIONS
  }).toString();
  let encrypted = CryptoJS.AES.encrypt(message, hash).toString();
  return {
    salt: salt,
    message: encrypted
  };
}

export function decrypt(message, password, salt) {
  let hash = CryptoJS.PBKDF2(password, salt, {
      keySize: HASH_LENGTH,
      iterations: ITERATIONS
    }).toString();
  message = message.replace(/\s/g, '+');
  return CryptoJS.enc.Latin1.stringify(CryptoJS.AES.decrypt(message, hash));
}

export function get(url, params, cb) {
  var xhr = new XMLHttpRequest();
  xhr.onload = () => {
    if (xhr.status == 200) {
      cb(null, JSON.parse(xhr.responseText));
    } else {
      cb('Connection error');
    }
  };
  xhr.onerror = (e) => {
    cb(e);
  };
  url += '?' + Object.keys(params).map((param) => params[param] ? param + '=' + params[param] : '').join('&');
  xhr.open('get', url, true);
  xhr.send();
}

export function post(url, params, cb) {
  var xhr = new XMLHttpRequest();
  xhr.onload = () => {
    if (xhr.status == 200) {
      cb(null, JSON.parse(xhr.responseText));
    } else {
      cb('Connection error');
    }
  };
  xhr.onerror = (e) => {
    cb(e);
  };
  xhr.open('post', url, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify(params));
}

export function formatTime(timestamp) {
  let now = new Date();
  let time = new Date(timestamp);
  if (now.getDate() == time.getDate() && now.getMonth() == time.getMonth() && now.getFullYear() == time.getFullYear()) {
    let hours = time.getHours();
    let minutes = time.getMinutes();
    if (minutes < 10) {
      minutes = '0' + minutes;
    }
    if (hours === 0) {
      return '12:' + minutes + ' AM';
    } else if (hours < 12) {
      return hours + ':' + minutes + ' AM';
    } else if (hours == 12) {
      return '12:' + minutes + ' PM';
    } else {
      return (hours - 12) + ':' + minutes + ' PM';
    }
  } else if (now.getFullYear() == time.getFullYear()) {
    return (time.getMonth() + 1) + '/' + time.getDate();
  } else {
    return (time.getMonth() + 1) + '/' + time.getDate() + '/' + time.getFullYear();
  }
}
