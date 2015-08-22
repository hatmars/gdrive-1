var readline = require('readline');
var config = require('./config');
var token = require('./token');
var common = require('./common');

var auth = common.createAuthObj(config, token);
common.refreshAccessToken(auth);