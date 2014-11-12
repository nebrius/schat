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
import { dispatch } from 'flvx';
import { actions } from 'actions';

export var HeaderView = React.createClass({
  render() {
    console.log(this.props.otherName ?
          (this.props.otherName + ' is ' + (this.props.otherOnline ? 'online' : 'offline')) +
            (this.props.otherTyping ? ', typing' : '') :
          null);
    return React.DOM.div({
      className: 'header_view'
    }, [
      React.DOM.div({
        className: 'header_status'
      }, [
        React.DOM.div({
          className: this.props.userOnline ? 'message_view_user_online' : 'message_view_user_offline'
        }, 'You are ' + (this.props.userOnline ? 'online' : 'offline')),
        React.DOM.div({
          className: this.props.otherOnline ? 'message_view_user_online' : 'message_view_user_offline'
        }, this.props.otherName ?
          (this.props.otherName + ' is ' + (this.props.otherOnline ? 'online' : 'offline')) +
            (this.props.otherTyping ? ', typing' : '') :
          null)
      ]),
      React.DOM.button({
        className: 'btn btn-default dropdown-toggle',
        type: 'button',
        onClick: () => {
          dispatch({
            type: actions.SETTINGS_REQUESTED
          });
        }
      }, 'Settings')
    ]);
  }
});
