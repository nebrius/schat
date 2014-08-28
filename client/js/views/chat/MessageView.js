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

import React from 'react';

function printTime(timestamp) {
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

window.printTime = printTime;

export var MessageView = React.createClass({
  render() {
    return new React.DOM.div({
      className: 'message_view ' + (this.props.isUser ? 'message_view_user' : 'message_view_other')
    }, [
      new React.DOM.div({
        className: 'message_view_header'
      }, [
        new React.DOM.span({
          className: 'message_view_name'
        }, this.props.name),
        new React.DOM.div({
          className: 'message_view_time'
        }, printTime(this.props.time))
      ]),
      new React.DOM.span({
        className: 'message_view_message'
      }, this.props.message)
    ]);
  }
});
