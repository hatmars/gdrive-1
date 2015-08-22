//getfileinfo.js

var config = require('./config');
var token = require('./token');
var gdrive = require('gdrive');

query = "title != '' ";
var auth = gdrive.createAuthObj(config, token);

gdrive.QueryFile(auth, query, function(files) {
	gdrive.PrintFilesInfo(files);
});