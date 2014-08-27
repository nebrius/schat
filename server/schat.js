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
var crypto = require('crypto');
var MongoClient = require('mongodb').MongoClient;
var Logger = require('transport-logger');
var UserManagement = require('user-management');
var express = require('express');
var bodyParser = require('body-parser')

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

    // The various URI encoding/decoding that goes on with tokens results in a slight mangling of the token
    function decodeToken(token) {
      return decodeURIComponent(token).replace(/\s/g, '+');
    }

    // Auth endpoint
    app.post('/api/auth', function(request, response) {
      var username = request.body.username;
      var password = request.body.password;
      users.authenticateUser(username, password, function(err, result) {
        if (err) {
          response.status(500).send('internal error');
          logger.error('Error authenticating user: ' + err);
        } else if (!result.userExists || !result.passwordsMatch) {
          response.status(401).send('unauthorized');
        } else {
          response.status(200).send(result.token);
        }
      });
    });

    app.get('/api/test', function(request, response) {
      users.isTokenValid(decodeToken(request.query.token), function(err, valid) {
        if (err) {
          response.status(500).send('internal error');
          logger.error('Error validating token: ' + err);
        } else if (!valid) {
          response.status(401).send('unauthorized');
        } else {
          database.collection('test', function(err, col) {
            if (err) {
              response.status(500).send('Internal error');
              logger.error('Error getting the test collection: ' + err);
              return;
            }
            col.findOne({}, function(err, item) {
              if (err) {
                response.status(500).send('Internal error');
                logger.error('Error getting the test item: ' + err);
                return;
              }
              if (!item) {
                response.status(404).send('');
              } else {
                response.status(200).send(JSON.stringify({
                  salt: item.salt,
                  message: item.message
                }));
              }
            });
          });
        }
      });
    });

    app.post('/api/test', function(request, response) {
      var salt = request.body.salt;
      var message = request.body.message;
      users.isTokenValid(decodeToken(request.body.token), function(err, valid) {
        if (err) {
          response.status(500).send('internal error');
          logger.error('Error validating token: ' + err);
        } else if (!valid) {
          response.status(401).send('unauthorized');
        } else {
          database.collection('test', function(err, col) {
            if (err) {
              response.status(500).send('Internal error');
              logger.error('Error getting the test collection: ' + err);
              return;
            }
            col.findOne({}, function(err, item) {
              if (item) {
                response.status(400).send('Bad request');
                logger.warning('Client attempted to overwrite existing test message');
                return;
              }
              col.insert({
                salt: salt,
                message: message
              }, { w: 1 }, function(err) {
                if (err) {
                  response.status(500).send('Internal error');
                  logger.error('Error inserting the test message: ' + err);
                  return;
                }
                response.status(200).send('ok');
              });
            });
          });
        }
      });
    });

    app.get('/api/messages', function(request, response) {
      var start = parseInt(request.query.start);
      var count = parseInt(request.query.count);
      var password = request.query.password;
      users.isTokenValid(decodeToken(request.query.token), function(err, valid) {
        if (err) {
          response.status(500).send('internal error');
          logger.error('Error validating token: ' + err);
        } else if (!valid) {
          response.status(401).send('unauthorized');
        } else {
          collection.find(null, {
            limit: count,
            skip: start
          }, function(err, items) {
          });
        }
      });
    });

    app.post('/api/message', function(request, response) {
      users.isTokenValid(decodeToken(request.token), function(err, valid) {
        if (err) {
          response.status(500).send('internal error');
        } else if (!valid) {
          response.status(401).send('unauthorized');
        } else {
        }
      });
    });

    // Start the server
    app.listen(options.port, '127.0.0.1');
    logger.info('Server listening on port ' + options.port);
  }

};
