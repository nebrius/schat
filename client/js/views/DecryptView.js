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
import { dispatcher } from 'flvx';
import { events } from 'events';
import { DecryptExistingView } from 'views/decrypt/DecryptExistingView';
import { DecryptNewView } from 'views/decrypt/DecryptNewView';


export let DecryptView = React.createClass({
  render() {
    if (this.props.type == 'existing') {
      return DecryptExistingView(this.props);
    } else if (this.props.type == 'new') {
      return DecryptNewView(this.props);
    } else {
      return new React.DOM.div(null, null);
    }
  },

  _onSubmit(e) {
    e.preventDefault();
    dispatcher.trigger({
      type: events.DECRYPTION_PASSWORD_SUBMITTED,
      password: document.getElementById('password').value
    });
  }
});
