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

export var SettingsView = React.createClass({
  render() {
    return React.DOM.div({}, [
      this.props.error ? React.DOM.div({ className: 'alert alert-danger' }, this.props.error) : null,
      React.DOM.div({
        className: 'panel panel-default'
      }, [
        React.DOM.div({
          className: 'panel-heading'
        }, React.DOM.h3({
          className: 'panel-title'
        }, 'Change Password')),
        React.DOM.form({
          className: 'panel-body',
          onSubmit: (e) => {
            e.preventDefault();
            dispatch({
              type: actions.CHANGE_PASSWORD_REQUESTED,
              currentPassword: document.getElementById('currentPassword').value,
              newPassword1: document.getElementById('newPassword1').value,
              newPassword2: document.getElementById('newPassword2').value
            });
          }
        }, [
          React.DOM.div({
            className: 'form-group'
          }, [
            React.DOM.label(null, 'Current Password'),
            React.DOM.input({
              type: 'password',
              className: 'form-control',
              id: 'currentPassword',
              placeholder: 'Enter current password'
            })
          ]),
          React.DOM.div({
            className: 'form-group'
          }, [
            React.DOM.label(null, 'New Password'),
            React.DOM.input({
              type: 'password',
              className: 'form-control',
              id: 'newPassword1',
              placeholder: 'Enter new password'
            })
          ]),
          React.DOM.div({
            className: 'form-group'
          }, [
            React.DOM.label(null, 'Repeat New Password'),
            React.DOM.input({
              type: 'password',
              className: 'form-control',
              id: 'newPassword2',
              placeholder: 'Enter new password'
            })
          ]),
          React.DOM.button({
            type: 'submit',
            className: 'btn btn-danger'
          }, 'Change Password')
        ])
      ]),
      !this.props.admin ? null : React.DOM.div({
        className: 'panel panel-default'
      }, [
        React.DOM.div({
          className: 'panel-heading'
        }, React.DOM.h3({
          className: 'panel-title'
        }, 'Admin Settings')),
        React.DOM.form({
          className: 'panel-body',
          onSubmit: (e) => {
            e.preventDefault();
            dispatch({
              type: actions.CHANGE_PASSWORD_REQUESTED,
              currentPassword: document.getElementById('currentPassword').value,
              newPassword1: document.getElementById('newPassword1').value,
              newPassword2: document.getElementById('newPassword2').value
            });
          }
        }, [

        ])
      ]),

      React.DOM.button({
        className: 'btn',
        onClick: () => {
          dispatch({
            type: actions.CLOSE_SETTINGS
          });
        }
      }, 'Close')
    ]);
  }
});
