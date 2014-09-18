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

import { registerRoute, registerGlobalStoreController, dispatch, route } from 'flvx';
import { GlobalStoreController } from 'store_controllers/GlobalStoreController';

import { LoginLinkController } from 'link_controllers/LoginLinkController';
import { LoginStoreController } from 'store_controllers/LoginStoreController';
import { LoginViewController } from 'view_controllers/LoginViewController';

import { DecryptLinkController } from 'link_controllers/DecryptLinkController';
import { DecryptStoreController } from 'store_controllers/DecryptStoreController';
import { DecryptViewController } from 'view_controllers/DecryptViewController';

import { ChatLinkController } from 'link_controllers/ChatLinkController';
import { ChatStoreController } from 'store_controllers/ChatStoreController';
import { ChatViewController } from 'view_controllers/ChatViewController';

import { SettingsLinkController } from 'link_controllers/SettingsLinkController';
import { SettingsStoreController } from 'store_controllers/SettingsStoreController';
import { SettingsViewController } from 'view_controllers/SettingsViewController';

import { actions } from 'actions';
import io from 'socketio';

registerGlobalStoreController(new GlobalStoreController());

console.log('Connecting to server');
let socket = io();
dispatch({
  type: actions.SOCKET_CREATED,
  socket: socket
});

registerRoute('login', {
  storeController: new LoginStoreController(),
  viewController: new LoginViewController(),
  linkController: new LoginLinkController()
});

registerRoute('decrypt', {
  storeController: new DecryptStoreController(),
  viewController: new DecryptViewController(),
  linkController: new DecryptLinkController()
});

registerRoute('chat', {
  storeController: new ChatStoreController(),
  viewController: new ChatViewController(),
  linkController: new ChatLinkController()
});

registerRoute('settings', {
  storeController: new SettingsStoreController(),
  viewController: new SettingsViewController(),
  linkController: new SettingsLinkController()
});

route('login');
