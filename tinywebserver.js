path = require('path');
var http = require('http');
var fs = require('fs');
 
var MIME_TYPES = {
    'css': 'text/css',
    'gif': 'image/gif',
    'htm': 'text/html',
    'html': 'text/html',
    'ico': 'image/x-icon',
    'jpeg': 'image/jpeg',
    'jpg': 'image/jpeg',
    'js': 'text/javascript',
    'json': 'application/json',
    'png': 'image/png',
    'txt': 'text/text'
};
 
var options = {
    host: 'localhost',
    port: 8080,
    index: 'index.html',
    docroot: '.'
};
 
var get_mime = function(filename) {
    var ext, type;
    for (ext in MIME_TYPES) {
        type = MIME_TYPES[ext];
        if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
            return type;
        }
    }
    return null;
};
 
 
var respond = function(request, response, status, content, content_type) {
    if (!status) {
        status = 200;
    }
 
    if (!content_type) {
        content_type = 'text/plain';
    }
    console.log("" + status + "\t" +
                request.method + "\t" + request.url);
    response.writeHead(status, {
        "Content-Type": content_type
    });
    if (content) {
        response.write(content);
    }
    return response.end();
};
 
var serve_file = function(request, response, requestpath) {
    return fs.readFile(requestpath, function(error, content) {
        if (error != null) {
            console.error("ERROR: Encountered error while processing " +
                          request.method + " of \"" + request.url + 
                          "\".", error);
            return respond(request, response, 500);
        } else {
            return respond(request, response, 200, 
                           content, get_mime(requestpath));
        }
    });
};
 
 
var return_index = function(request, response, requestpath)  {
 
    var exists_callback = function(file_exists) {
        if (file_exists) {
            return serve_file(request, response, requestpath);
        } else {
            return respond(request, response, 404);
        }
    }
 
    if (requestpath.substr(-1) !== '/') {
        requestpath += "/";
    }
    requestpath += options.index;
    return fs.exists(requestpath, exists_callback);
}
 
var request_handler = function(request, response) {
    var requestpath;
 
    if (request.url.match(/((\.|%2E|%2e)(\.|%2E|%2e))|(~|%7E|%7e)/) != null) {
        console.warn("WARNING: " + request.method +
                     " of \"" + request.url + 
                     "\" rejected as insecure.");
        return respond(request, response, 403);
    } else {
        requestpath = path.normalize(path.join(options.docroot, request.url));
        return fs.exists(requestpath, function(file_exists) {
            if (file_exists) {
                return fs.stat(requestpath, function(err, stat) {
                    if (err != null) {
                        console.error("ERROR: Encountered error calling" +
                                      "fs.stat on \"" + requestpath + 
                                      "\" while processing " + 
                                      request.method + " of \"" + 
                                      request.url + "\".", err);
                        return respond(request, response, 500);
                    } else {
                        if ((stat != null) && stat.isDirectory()) {
                            return return_index(request, response, requestpath);
                        } else {
                            return serve_file(request, response, requestpath);
                        }
                    }
                });
            } else {
                return respond(request, response, 404);
            }
        });
    }
};
 
var server = http.createServer(request_handler);
 
server.listen(options.port, options.host, function() {
    return console.log("Server listening at http://" +
                       options.host + ":" + options.port + "/");
});
