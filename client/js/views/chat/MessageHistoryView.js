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
import { MessageView } from 'views/chat/MessageView';

let timeout = Symbol();

export var MessageHistoryView = React.createClass({
  render() {
    return React.DOM.div({
      className: 'message_history_view'
    }, [
      React.DOM.div({
        className: 'message_history_view_container'
      }, this.props.messages.map((message) => new MessageView(message)))
    ]);
  },
  componentDidMount() {
    if (this.props.lockedToBottom) {
      // I hate this
      this[timeout] = setTimeout(() => {
        this[timeout] = null;
        let parent = this.getDOMNode();
        let container = parent.children[0];
        let parentHeight = parseInt(window.getComputedStyle(parent).height);
        let containerHeight = parseInt(window.getComputedStyle(container).height);
        if (parentHeight > containerHeight) {
          container.style.height = parentHeight + 'px';
        } else {
          parent.scrollTop = containerHeight + 1; // +1 to account for rounding errors
        }
      }, 10);
    }
  },
  componentWillUnmount() {
    clearTimeout(this[timeout]);
  }
});
