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
var http = require('http');
var errors = require('../shared/errors');

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

    var app = express();
    app.use(bodyParser.json());

    // The various URI encoding/decoding that goes on with tokens results in a slight mangling of the token
    function decodeToken(token) {
      return decodeURIComponent(token).replace(/\s/g, '+');
    }

    app.post('/api/login', function (req, res) {
      var username = req.body.username;
      var password = req.body.password;
      users.authenticateUser(username, password, function(err, result) {
        if (err) {
          res.send({
            success: false,
            error: errors.SERVER_ERROR
          });
          logger.error('Error authenticating user: ' + err);
        } else if (!result.userExists || !result.passwordsMatch) {
          res.send({
            success: false,
            error: errors.UNAUTHORIZED
          });
        } else {
          users.getExtrasForToken(result.token, function(err, extras) {
            if (err) {
              res.send({
                success: false,
                error: errors.SERVER_ERROR
              });
              logger.error('Error authenticating user: ' + err);
            } else {
              res.send({
                success: true,
                token: result.token,
                extras: extras
              });
            }
          });
        }
      });
    });

      /*socket.on(messages.AUTH, function(msg) {

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

      socket.on(messages.CHANGE_PASSWORD, function(msg) {
        users.isTokenValid(decodeToken(msg.token), function(err, valid) {
          if (err) {
            socket.emit(messages.CHANGE_PASSWORD_RESPONSE, {
              success: false,
              error: errors.SERVER_ERROR
            });
            logger.error('Error validating token: ' + err);
          } else if (!valid) {
            socket.emit(messages.CHANGE_PASSWORD_RESPONSE, {
              success: false,
              error: errors.UNAUTHORIZED
            });
          } else {
            users.changePassword(msg.token, msg.oldPassword, msg.newPassword, function(err) {
              if (err) {
                socket.emit(messages.CHANGE_PASSWORD_RESPONSE, {
                  success: false,
                  error: err == 'Invalid password' ? errors.INVALID_PASSWORD : errors.SERVER_ERROR
                });
              } else {
                socket.emit(messages.CHANGE_PASSWORD_RESPONSE, {
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

      socket.on(messages.GET_MESSAGE_BLOCK, function(msg) {
        users.isTokenValid(decodeToken(msg.token), function(err, valid) {
          if (err) {
            socket.emit(messages.GET_MESSAGE_BLOCK_RESPONSE, {
              success: false,
              error: errors.SERVER_ERROR
            });
            logger.error('err', 'Error validating token: ' + err);
          } else if (!valid) {
            socket.emit(messages.GET_MESSAGE_BLOCK_RESPONSE, {
              success: false,
              error: errors.UNAUTHORIZED
            });
          } else {
            var count = parseInt(msg.count);
            if (isNaN(count)) {
              count = 100;
            }
            var start = parseInt(msg.start);
            if (isNaN(start)) {
              start = 0;
            }
            collection.find({}, { _id: false }).sort({ time: -1 }).limit(count).skip(start).toArray(function(err, msgs) {
              if (err) {
                socket.emit(messages.GET_MESSAGE_BLOCK_RESPONSE, {
                  success: false,
                  error: errors.SERVER_ERROR
                });
                logger.error('err', 'Error validating token: ' + err);
              } else {
                socket.emit(messages.GET_MESSAGE_BLOCK_RESPONSE, {
                  success: true,
                  messages: msgs || []
                });
              }
            });
          }
        });
      });

      socket.on(messages.SUBMIT_NEW_MESSAGE, function(msg) {
        users.isTokenValid(decodeToken(msg.token), function (err, valid) {
          if (err) {
            logger.error('err', 'Error validating token: ' + err);
          } else if (valid) {
            users.getUsernameForToken(msg.token, function(err, username) {
              if (err) {
                logger.error('err', 'Error getting a username from a token: ' + err);
                return;
              }
              var entry = {
                message: msg.message,
                salt: msg.salt,
                name: username,
                time: Date.now()
              };
              collection.insert(entry, { w: 1 }, function(err) {
                if (err) {
                  logger.error('Error inserting a message: ' + err);
                  return;
                }
                io.emit(messages.NEW_MESSAGE, entry);
              });
            });
          }
        });
      });
    });*/

    // Start the server
    var server = app.listen(options.port, '127.0.0.1', function() {
      logger.info('Server listening on port ' + server.address().port);
    });
  }

};
