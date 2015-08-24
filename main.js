var fs = require('fs');
var moment = require('moment');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var XMLHttpRequest = require("./XMLHttpRequest").XMLHttpRequest;



function createAuthObj(config, token) {
  var auth = new OAuth2(config.CLIENT_ID, config.CLIENT_SECRET, config.REDIRECT_URL);
  if (token)
    auth.setCredentials(token);
  return auth;
}

function autoRefreshToken(auth, token) {
  var minutes = getTokenTimeLeft(token);
  console.log("[autoRefreshToken] getTokenTimeLeft: " + minutes + "m");
  minutes = Math.min(Math.max(minutes - 1, 0.5), 10);
  console.log("[autoRefreshToken] next refresh time: " + minutes + "m");
  setTimeout(function() {
    refreshAccessToken(auth);
  }, minutes * 60 * 1000);
}

function generateAuthUrl(auth, config) {
  var url = auth.generateAuthUrl({
    approval_prompt: "force",
    access_type: 'offline',
    scope: config.SCOPE
  });
  return url;
}

function getTokenTimeLeft(token) {
  var expire = new moment(token.expiry_date);
  console.log("expire time:", expire.fromNow());
  return moment.duration(expire.diff(new moment())).minutes();
}

function getAndSaveToken(auth, code) {
  auth.getToken(code, function(err, tokens) {
    if (err) {
      console.log('[Error] while trying to retrieve access token', err);
    } else {
      console.log('----Congratulation! Your access token is:\n\n', tokens);
      saveTokenToFile(tokens);
    }
  });
}

function saveTokenToFile(tokens) {
  var msg = JSON.stringify(tokens);
  var fd = fs.openSync("token.js", "w+");
  fs.writeSync(fd, "var token = " + msg + ";\nmodule.exports = token;");
  fs.close(fd);
  console.log("[saveTokenToFile] success.");
}

function refreshAccessToken(auth) {
  auth.refreshAccessToken(function(err, tokens) {
    // your access_token is now refreshed and stored in oauth2Client
    // store these new tokens in a safe place (e.g. database)
    if (err) {
      console.error("[Error] refreshAccessToken, err=" + err);
    } else {
      console.log("[refreshAccessToken] success, tokens:\n" + JSON.stringify(tokens));
      auth.setCredentials(tokens);
      saveTokenToFile(tokens);
      autoRefreshToken(auth, tokens);
    }
  });
}

function retrieveAllFiles(drive, query, callback) {
  var result = [];
  var retrievePageOfFiles = function(err, resp) {
    if (err) {
      console.log('[Error] retrievePageOfFiles', err);
      callback(null);
      return;
    }
    // console.log('resp', resp);
    result = result.concat(resp.items);
    if (resp && resp.nextPageToken) {
      drive.files.list({
        'corpus': 'DOMAIN',
        'pageToken': resp.nextPageToken,
        'q': query,
      }, retrievePageOfFiles);
    } else {
      callback(result);
    }
  };
  drive.files.list({
    'corpus': 'DOMAIN',
    'q': query,
    //'pageToken':0,
  }, retrievePageOfFiles);
}


/**
 * Download a file's content.
 *
 * @param {File} file Drive File instance.
 * @param {Function} callback Function to call when the request is complete.
 */
function downloadSingleFile(auth, file, callback) {
  if (file && file['exportLinks'] && file['exportLinks']['text/csv']) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', file['exportLinks']['text/csv']);
    xhr.setRequestHeader('Authorization', 'Bearer ' + auth.credentials.access_token);
    xhr.onload = function() {
      callback(file, xhr.responseText);
    };
    xhr.onerror = function() {
      callback(null);
    };
    xhr.send();
  } else {
    callback(null);
  }
}



function QueryFile(auth, query, callback) {
  var drive = google.drive({
    version: 'v2',
    auth: auth
  });
  retrieveAllFiles(drive, query, function(files) {
    if (!files) {
      console.log('[Error] No files.');
      return;
    }
    callback(files);
  });
}

function PrintFilesInfo(files) {
  console.log('[Info] The amount of files: ', files.length);
  console.log('[');
  console.log("id\ttitle\tmimeType");
  for (var i = 0, len = files.length; i < len; ++i) {
    var file = files[i];
    console.log(file.id, file.title, file.mimeType);
  }
  console.log(']');
}

function DownloadFiles(auth, files, download_cb) {
  for (var i = 0, len = files.length; i < len; ++i) {
    var file = files[i];
    downloadSingleFile(auth, file, download_cb);
  }
}

function DownloadFileByID(auth, fileid, download_cb) {
  var drive = google.drive({
    version: 'v2',
    auth: auth
  });
  drive.files.get({
    'fileId': fileid
  }, function(err, file) {
    if (err) {
      console.log("[DownloadFileByID] err=" + err);
      return;
    }
    downloadSingleFile(auth, file, download_cb);
  });
}

function retrieveAllFilesInFolder(drive, folderId, callback) {
  var result = [];
  var retrievePageOfChildren = function(err, resp) {
    if (err) {
      console.log('[Error] retrievePageOfChildren', err);
      callback(null);
      return;
    }
    result = result.concat(resp.items);
    if (resp && resp.nextPageToken) {
      drive.files.list({
        'folderId': folderId,
        'pageToken': resp.nextPageToken,
      }, retrievePageOfChildren);
    } else {
      callback(result);
    }
  };
  drive.children.list({
    'folderId': folderId
  }, retrievePageOfChildren);

}


function GetFolderFiles(auth, folderId, callback) {
  var drive = google.drive({
    version: 'v2',
    auth: auth
  });
  retrieveAllFilesInFolder(drive, folderId, function(files) {
    if (!files) {
      console.log('[Error] No files.');
      callback(null);
    } else {
      callback(files);
    }
  });
}



module.exports = {
  createAuthObj: createAuthObj,
  autoRefreshToken: autoRefreshToken,
  getTokenTimeLeft: getTokenTimeLeft,
  generateAuthUrl: generateAuthUrl,
  getAndSaveToken: getAndSaveToken,
  saveTokenToFile: saveTokenToFile,
  refreshAccessToken: refreshAccessToken,
  retrieveAllFiles: retrieveAllFiles,
  downloadSingleFile: downloadSingleFile,
  QueryFile: QueryFile, //https://developers.google.com/drive/web/search-parameters
  PrintFilesInfo: PrintFilesInfo,
  DownloadFiles: DownloadFiles,
  DownloadFileByID: DownloadFileByID,
  GetFolderFiles: GetFolderFiles,
};