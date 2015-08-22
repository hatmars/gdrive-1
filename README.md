
###How to use:

1. Make sure you have a google account, and you should create a project in [https://console.developers.google.com/](https://console.developers.google.com/).
2. Enter your project's console homepage, and go into **APIs & auth -> Credentials**, then add a credentials for your project.
3. set your **Authorized JavaScript origins**.
4. set your **Authorized redirect URIs**, this url should be put info config.json with Key REDIRECT_URL.
5. create a **config.json** locally, just like below:

	```c
	{
		"CLIENT_ID": "your CLIENT_ID",
		"CLIENT_SECRET": "your CLIENT_ID",
		"REDIRECT_URL": "http://localhost:80/oauth2callback",
		"SCOPE": "https://www.googleapis.com/auth/drive"
	}
	```

6. run the gettoken.js, which is written for getting the access tokens:

	```c
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
	
	```

7. run the getfileinfo.js, which is written for getting the files info from google drive:
	
	```c
	//getfileinfo.js
	
	var config = require('./config');
	var token = require('./token');
	var gdrive = require('gdrive');
	
	query = "title != '' ";
	var auth = gdrive.createAuthObj(config, token);
	
	gdrive.QueryFile(auth, query, function(files) {
		gdrive.PrintFilesInfo(files);
	});
	```
