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

var crypto = require('crypto');
var program = require('commander');
var prompt = require('prompt');
var MongoClient = require('mongodb').MongoClient;
var UserManagement = require('user-management');

var SALT_LENGTH = 64; // Length of the salt, in bytes
var HASH_LENGTH = 64; // Length of the hash, in bytes
var HASH_ITERATIONS = 1000; // Number of pbkdf2 iterations

module.exports = function run(argv) {
  program
    .version(require('../package.json').version)
    .option('-c, --create-user', 'Creates a user')
    .option('-i --initialize', 'Initializes a chat with the given password. The password is NOT stored')
    .parse(argv);

  if (program.createUser) {
    createUser();
  } else if (program.initialize) {
    initialize();
  } else {
    program.outputHelp();
  }

  function createUser() {
    var schema = {
      properties: {
        username: {
          description: 'Enter a username',
          pattern: /^[a-zA-Z\s\-]+$/,
          message: 'Username must be only letters, spaces, or dashes',
          required: true
        },
        password1: {
          description: 'Enter a password',
          hidden: true
        },
        password2: {
          description: 'Repeat the password',
          hidden: true
        }
      }
    };

    prompt.start();
    prompt.get(schema, function (err, result) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      if (result.password1 != result.password2) {
        console.error('Passwords do not match');
        process.exit(1);
      }
      var users = new UserManagement({
        database: 'schat_users'
      });
      users.load(function (err) {
        if (err) {
          console.error('Error: ' + err);
          users.close();
          return;
        }
        users.userExists(result.username, function(err, exists) {
          if (err) {
            console.error('Error: ' + err);
            users.close();
          } else if (exists) {
            console.log('User already exists');
            users.close();
          } else {
            users.createUser(result.username, result.password1, {}, function (err) {
              if (err) {
                console.error('Error: ' + err);
              } else {
                console.log('User created');
              }
              users.close();
            });
          }
        });
      });
    });
  }

  function initialize() {
    var schema = {
      properties: {
        password1: {
          description: 'Enter a password',
          hidden: true
        },
        password2: {
          description: 'Repeat the password',
          hidden: true
        }
      }
    };

    prompt.start();
    prompt.get(schema, function (err, result) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      if (result.password1 != result.password2) {
        console.error('Passwords do not match');
        process.exit(1);
      }

      function generateSalt(cb) {
        crypto.randomBytes(SALT_LENGTH, cb);
      }

      function hash(data, salt, cb) {
        crypto.pbkdf2(data, salt, HASH_ITERATIONS, HASH_LENGTH, function(err, hash) {
          if (err) {
            cb(err);
            return;
          }
          cb(null, {
            salt: salt,
            hash: hash
          });
        });
      }

      function saltAndHash(data, cb) {
        generateSalt(function(err, salt) {
          if (err) {
            cb(err);
            return;
          }
          hash(data, salt, cb);
        });
      }

      // Do stuff
      saltAndHash(result.password1, function(err, hash) {
        if (err) {
          console.error('error hashing password');
          process.exit(1);
        }
        MongoClient.connect('mongodb://localhost:27017/schat', function(err, database) {
          if (err) {
            console.error('Could not connect to database');
            process.exit(1);
          }
          database.collection('cipher_check', function(err, col) {
            if (err) {
              console.error('Could not fetch the collection');
              process.exit(1);
            }
            var cipher = crypto.createCipher('aes-256-cbc', hash.hash);
            var encodedMessage = cipher.update('This is the encrypted cipher check');
            col.insert({
              salt: hash.salt.toString('base64'),
              message: encodedMessage.toString('base64')
            }, { w: 1 }, function(err) {
              if (err) {
                console.error('Could not save cipher check');
                process.exit(1);
              }
              process.exit();
            });
          });
        });
      });
    });
  }
};
