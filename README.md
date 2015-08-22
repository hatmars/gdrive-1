##English:

###How to use:

1. Make sure you have a google account, and you should create a project in [https://console.developers.google.com/](https://console.developers.google.com/).
2. Enter your project's console homepage, and go into **APIs & auth -> Credentials**, then add a credentials for your project.
3. using the credentials information to create a **config.json** locally, just like below:

	```c
	{
		"CLIENT_ID": "your CLIENT_ID",
		"CLIENT_SECRET": "your CLIENT_ID",
		"REDIRECT_URL": "http://localhost:80/oauth2callback",
		"SCOPE": "https://www.googleapis.com/auth/drive"
	}
	```

4. run the test.js, which is written for get the access tokens:

	```c
	var readline = require('readline');
	var config = require('./config');
	var common = require('gdrive');
	
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


##中文：

###如何使用:

1) CLIENT_ID和CLIENT_SECRET在这个页面获取：
Google Developers Console -> 项目(要自己创建) -> API和验证 -> 验证
点击OAuth 2.0 用戶端 ID列表的其中一个用戶端 ID，就能看到用户端密码了
https://console.developers.google.com/project/custom-altar-95703/apiui/credential

2)在API和验证 -> 验证，设置：
【已授權的 JavaScript 來源】->【http://localhost】
【已授權的重新導向 URI】 -> 【http://localhost/oauth2callback】 要和下面的REDIRECT_URL一致

3)执行auth.generateAuthUrl({ scope: SCOPE });
会返回一个url地址，把这个地址复制到浏览器并打开，可能会弹出一个google授权页面，
授权后会跳转到一个空页面，此时把这个跳转后的页面的地址复制下来，
比如【http://localhost/oauth2callback?code=4/W_UGgQX-oJcrvEdgLZHJm2bqQJiW8GCwVdcicTbYpi4#】
把code=后面的所有字符复制，然后粘贴在控制台，并回车确定

4)程序会自动获取token信息（相当于一个不需要密码的访问钥匙），token是一个字典结构，有3个key：
access_token, token_type, expiry_date，把三个信息都保存下，以后就不需要执行上面的1、2、3去获取token了，
只要auth.credentials = oldTokens;即可以访问。
注意，每次执行1、2、3步骤获取的token都是不一样的。