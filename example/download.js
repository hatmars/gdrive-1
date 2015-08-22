var config = require('./config');
var token = require('./token');
var common = require('./common');

console.log('mimutes left:', common.getTokenTimeLeft(token) );


query = "title = 'abc.txt'";
var auth = common.createAuthObj(config, token);
common.autoRefreshToken(auth, token);
common.QueryFile(auth, query, function(files) {
	common.PrintFilesInfo(files);
});