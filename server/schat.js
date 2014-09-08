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

var path = require('path');
var MongoClient = require('mongodb').MongoClient;
var Logger = require('transport-logger');
var UserManagement = require('user-management');
var express = require('express');
var bodyParser = require('body-parser');
var socketio = require('socket.io');
var http = require('http');
var errors = require('../shared/errors');
var messages = require('../shared/messages');

module.exports = function run(options) {

  // Create the logger
  var logger;
  if (options.logFile) {
    logger = new Logger([{
      destination: options.logFile,
      minLevel: 'debug',
      timestamp: true,
      prependLevel: true
    }, {
      minLevel: 'info'
    }]);
  } else {
    logger = new Logger();
  }

  // Load user management
  var users = new UserManagement({
    database: 'schat_users'
  });
  var database, collection;
  users.load(function(err) {
    if (err) {
      throw err;
    }
    MongoClient.connect(
      'mongodb://localhost:27017/schat', function (err, db) {
        if (err) {
          logger.error('Could not connect to database: ' + err);
          process.exit(1);
        }
        database = db;
        database.collection('messages', function(err, col) {
          if (err) {
            logger.error('Could not connect to collection: ' + err);
            process.exit(1);
          }
          collection = col;
          start();
        });
      }
    );
  });

  // Start the server
  function start() {

    // Create the server
    var app = express();
    app.use('/', express.static(path.join(__dirname, '..', 'client-dist')));
    app.use(bodyParser.urlencoded({ extended: false }));
    var server = http.Server(app);
    var io = socketio(server);

    // The various URI encoding/decoding that goes on with tokens results in a slight mangling of the token
    function decodeToken(token) {
      return decodeURIComponent(token).replace(/\s/g, '+');
    }

    io.on('connection', function(socket) {
      socket.on('disconnect', function(msg) {
      });

      socket.on(messages.AUTH, function(msg) {
        var username = msg.username;
        var password = msg.password;
        users.authenticateUser(username, password, function(err, result) {
          if (err) {
            socket.emit(messages.AUTH_RESPONSE, {
              success: false,
              error: errors.SERVER_ERROR
            });
            logger.error('Error authenticating user: ' + err);
          } else if (!result.userExists || !result.passwordsMatch) {
            socket.emit(messages.AUTH_RESPONSE, {
              success: false,
              error: errors.UNAUTHORIZED
            });
          } else {
            socket.emit(messages.AUTH_RESPONSE, {
              success: true,
              token: result.token
            });
          }
        });
      });

      socket.on(messages.LOGOUT, function(msg) {
        users.isTokenValid(decodeToken(msg.token), function(err, valid) {
          if (err) {
            socket.emit(messages.LOGOUT_RESPONSE, {
              success: false,
              error: errors.SERVER_ERROR
            });
            logger.error('Error validating token: ' + err);
          } else if (!valid) {
            socket.emit(messages.LOGOUT_RESPONSE, {
              success: false,
              error: errors.UNAUTHORIZED
            });
          } else {
            users.expireToken(msg.token, function(err) {
              if (err) {
                socket.emit(messages.LOGOUT_RESPONSE, {
                  success: false,
                  error: errors.SERVER_ERROR
                });
                logger.error('Error validating token: ' + err);
              } else {
                socket.emit(messages.LOGOUT_RESPONSE, {
                  success: true
                });
              }
            });
          }
        });
      });

      socket.on(messages.GET_TEST, function(msg) {
        users.isTokenValid(decodeToken(msg.token), function(err, valid) {
          if (err) {
            socket.emit(messages.GET_TEST_RESPONSE, {
              success: false,
              error: errors.SERVER_ERROR
            });
            logger.error('Error validating token: ' + err);
          } else if (!valid) {
            socket.emit(messages.GET_TEST_RESPONSE, {
              success: false,
              error: errors.UNAUTHORIZED
            });
          } else {
            database.collection('test', function(err, col) {
              if (err) {
                socket.emit(messages.GET_TEST_RESPONSE, {
                  success: false,
                  error: errors.SERVER_ERROR
                });
                logger.error('Error getting the test collection: ' + err);
                return;
              }
              col.findOne({}, function(err, item) {
                if (err) {
                  socket.emit(messages.GET_TEST_RESPONSE, {
                    success: false,
                    error: errors.SERVER_ERROR
                  });
                  logger.error('Error getting the test item: ' + err);
                  return;
                }
                if (!item) {
                  socket.emit(messages.GET_TEST_RESPONSE, {
                    success: false,
                    error: errors.TEST_NOT_SET
                  });
                } else {
                  socket.emit(messages.GET_TEST_RESPONSE, {
                    success: true,
                    salt: item.salt,
                    message: item.message
                  });
                }
              });
            });
          }
        });
      });

      socket.on(messages.SET_TEST, function(msg) {
        var salt = msg.salt;
        var message = msg.message;
        users.isTokenValid(decodeToken(msg.token), function(err, valid) {
          if (err) {
            socket.emit(messages.SET_TEST_RESPONSE, {
              success: false,
              error: errors.SERVER_ERROR
            });
            logger.error('Error validating token: ' + err);
          } else if (!valid) {
            socket.emit(messages.SET_TEST_RESPONSE, {
              success: false,
              error: errors.UNAUTHORIZED
            });
          } else {
            database.collection('test', function(err, col) {
              if (err) {
                socket.emit(messages.SET_TEST_RESPONSE, {
                  success: false,
                  error: errors.SERVER_ERROR
                });
                logger.error('Error getting the test collection: ' + err);
                return;
              }
              col.findOne({}, function(err, item) {
                if (err) {
                  socket.emit(messages.SET_TEST_RESPONSE, {
                    success: false,
                    error: errors.SERVER_ERROR
                  });
                  logger.error('Error finding the test message: ' + err);
                  return;
                }
                if (item) {
                  socket.emit(messages.SET_TEST_RESPONSE, {
                    success: false,
                    error: errors.INVALID_REQUEST
                  });
                  logger.warning('Client attempted to overwrite existing test message');
                  return;
                }
                col.insert({
                  salt: salt,
                  message: message
                }, { w: 1 }, function(err) {
                  if (err) {
                    socket.emit(messages.SET_TEST_RESPONSE, {
                      success: false,
                      error: errors.SERVER_ERROR
                    });
                    logger.error('Error inserting the test message: ' + err);
                    return;
                  }
                  socket.emit(messages.SET_TEST_RESPONSE, {
                    success: true
                  });
                });
              });
            });
          }
        });
      });

      socket.on('sendMessage', function(msg) {
        debugger;
      });

      socket.on('getMessages', function(msg) {
        users.isTokenValid(decodeToken(msg.token), function(err, valid) {
          if (err) {
            socket.emit('internal error');
            logger.error('err', 'Error validating token: ' + err);
          } else if (!valid) {
            socket.emit('err', 'unauthorized');
          } else {
            var MINUTES_IN_MILLIS = 1000 * 60;
            socket.emit('messages', [{
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
            }]);
          }
        });
      });
    });

    // Start the server
    server.listen(options.port, '127.0.0.1', function() {
      logger.info('Server listening on port ' + options.port);
    });
  }

};
