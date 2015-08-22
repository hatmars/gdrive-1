//gettoken.js

var readline = require('readline');
var config = require('./config');
var gdrive = require('gdrive');

var auth = gdrive.createAuthObj(config);
var url = gdrive.generateAuthUrl(auth, config);

console.log('----copy the url below, and access it by browser:\n\n' + url);

var rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

var getAccessToken = function(code) {
	common.getToken(auth, code);
};

rl.question('\n\n----Enter the code here:\n\n', getAccessToken);