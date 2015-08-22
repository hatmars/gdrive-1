//refreshtoken.js

var readline = require('readline');
var config = require('./config');
var token = require('./token');
var gdrive = require('gdrive');


var auth = gdrive.createAuthObj(config, token);

console.log('mimutes left:', gdrive.getTokenTimeLeft(token));

common.refreshAccessToken(auth);