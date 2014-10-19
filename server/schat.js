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

    app.post('/api/logout', function(req, res) {
      users.isTokenValid(decodeToken(req.body.token), function(err, valid) {
        if (err) {
          res.send({
            success: false,
            error: errors.SERVER_ERROR
          });
          logger.error('Error validating token: ' + err);
        } else if (!valid) {
          res.send({
            success: false,
            error: errors.UNAUTHORIZED
          });
        } else {
          users.expireToken(req.body.token, function(err) {
            if (err) {
              res.send({
                success: false,
                error: errors.SERVER_ERROR
              });
              logger.error('Error validating token: ' + err);
            } else {
              res.send({
                success: true
              });
            }
          });
        }
      });
    });

    app.post('/api/change_password', function(req, res) {
      users.isTokenValid(decodeToken(req.body.token), function(err, valid) {
        if (err) {
          res.send({
            success: false,
            error: errors.SERVER_ERROR
          });
          logger.error('Error validating token: ' + err);
        } else if (!valid) {
          res.send({
            success: false,
            error: errors.UNAUTHORIZED
          });
        } else {
          users.changePassword(req.body.token, req.body.oldPassword, req.body.newPassword, function(err) {
            if (err) {
              res.send({
                success: false,
                error: err == 'Invalid password' ? errors.INVALID_PASSWORD : errors.SERVER_ERROR
              });
            } else {
              res.send({
                success: true
              });
            }
          });
        }
      });
    });

    app.get('/api/test', function(req, res) {
      users.isTokenValid(decodeToken(req.query.token), function(err, valid) {
        if (err) {
          res.send({
            success: false,
            error: errors.SERVER_ERROR
          });
          logger.error('Error validating token: ' + err);
        } else if (!valid) {
          res.send({
            success: false,
            error: errors.UNAUTHORIZED
          });
        } else {
          database.collection('test', function(err, col) {
            if (err) {
              res.send({
                success: false,
                error: errors.SERVER_ERROR
              });
              logger.error('Error getting the test collection: ' + err);
              return;
            }
            col.findOne({}, function(err, item) {
              if (err) {
                res.send({
                  success: false,
                  error: errors.SERVER_ERROR
                });
                logger.error('Error getting the test item: ' + err);
                return;
              }
              if (!item) {
                res.send({
                  success: false,
                  error: errors.TEST_NOT_SET
                });
              } else {
                res.send({
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

    app.post('/api/test', function(req, res) {
      var salt = req.body.salt;
      var message = req.body.message;
      users.isTokenValid(decodeToken(req.body.token), function(err, valid) {
        if (err) {
          res.send({
            success: false,
            error: errors.SERVER_ERROR
          });
          logger.error('Error validating token: ' + err);
        } else if (!valid) {
          res.send({
            success: false,
            error: errors.UNAUTHORIZED
          });
        } else {
          database.collection('test', function(err, col) {
            if (err) {
              res.send({
                success: false,
                error: errors.SERVER_ERROR
              });
              logger.error('Error getting the test collection: ' + err);
              return;
            }
            col.findOne({}, function(err, item) {
              if (err) {
                res.send({
                  success: false,
                  error: errors.SERVER_ERROR
                });
                logger.error('Error finding the test message: ' + err);
                return;
              }
              if (item) {
                res.send({
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
                  res.send({
                    success: false,
                    error: errors.SERVER_ERROR
                  });
                  logger.error('Error inserting the test message: ' + err);
                  return;
                }
                res.send({
                  success: true
                });
              });
            });
          });
        }
      });
    });

    app.get('/api/messages', function(req, res) {
      users.isTokenValid(decodeToken(req.query.token), function(err, valid) {
        if (err) {
          res.send({
            success: false,
            error: errors.SERVER_ERROR
          });
          logger.error('err', 'Error validating token: ' + err);
        } else if (!valid) {
          res.send({
            success: false,
            error: errors.UNAUTHORIZED
          });
        } else {
          var count = parseInt(req.query.count);
          if (isNaN(count)) {
            count = 100;
          }
          var start = parseInt(req.query.start);
          if (isNaN(start)) {
            start = 0;
          }
          collection.find({}, { _id: false }).sort({ time: -1 }).limit(count).skip(start).toArray(function(err, msgs) {
            if (err) {
              res.send({
                success: false,
                error: errors.SERVER_ERROR
              });
              logger.error('err', 'Error validating token: ' + err);
            } else {
              res.send({
                success: true,
                messages: msgs || []
              });
            }
          });
        }
      });
    });

    app.post('/api/messages', function(req, res) {
      users.isTokenValid(decodeToken(req.body.token), function (err, valid) {
        if (err) {
          res.send({
            success: false
          });
          logger.error('err', 'Error validating token: ' + err);
        } else if (valid) {
          users.getUsernameForToken(req.body.token, function(err, username) {
            if (err) {
              res.send({
                success: false
              });
              logger.error('err', 'Error getting a username from a token: ' + err);
              return;
            }
            var entry = {
              message: req.body.message,
              salt: req.body.salt,
              name: username,
              time: Date.now()
            };
            collection.insert(entry, { w: 1 }, function(err) {
              if (err) {
                res.send({
                  success: false
                });
                logger.error('Error inserting a message: ' + err);
              } else {
                res.send({
                  success: true
                });
              }
            });
          });
        }
      });
    });

    // Start the server
    var server = app.listen(options.port, '127.0.0.1', function() {
      logger.info('Server listening on port ' + server.address().port);
    });
  }

};
