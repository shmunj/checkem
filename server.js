var request = require('request');
var express = require('express');
var util = require('util');

var app = express();
app.use(express.static('public'));
var PORT = process.env.PORT || 3000;
var server = app.listen(PORT, function() {
    util.log(`Server running at port ${PORT}`);
});
app.set('view engine', 'pug');

var requestOptions = { json: true };
var waitTime = 1000;
var lastCallAt = getTime();

function getTime() {
    var d = new Date();
    return d.getTime();
}

function checkThread(board, thread, callback) {
    var apidata = {};
    apidata.board = board;
    apidata.thread = thread;
    apidata.posts = 0;
    apidata.dubscount = 0;
    apidata.dubs = [];
    apidata.time = 0;

    var url = `http://a.4cdn.org/${board}/thread/${thread}.json`;
    request(url, requestOptions, function(err, res, data) {
        lastCallAt = getTime();
        apidata.time = lastCallAt;

        if (err) throw err;
        
        if (data === undefined) {
            callback(false);
        } else {
            data.posts.forEach(function(post) {
                if (/(\d)\1+$/.test(post.no.toString())) {
                    apidata.dubs.push(post.no);
                }
            });

            apidata.posts = data.posts.length;
            apidata.dubscount = apidata.dubs.length;
            apidata.dubspercent = Math.round(apidata.dubscount * 100 / apidata.posts * 100) / 100;
            callback(apidata);
        }
    });
}

app.get('/', function(req, res) {
    res.render('thread');
});

app.get('/check', function(req, res) {
    res.render('thread');
});

app.get('/check/:board/:thread', function(req, res) {
    serveThread(req, res, 'html');
});

app.get('/data/:board/:thread', function(req, res) {
    serveThread(req, res, 'json');
});

function serveThread(req, res, type) {
    var msg;

    if (/^\d+$/.test(req.params.thread)) {
        if (getTime() - lastCallAt < waitTime) {
            msg = 'Error: Wait a bit.';
            serveError(res, msg, type);
            logReq(req, msg);
        
        } else {
            checkThread(req.params.board, req.params.thread, function(data) {
                if (data) {
                    msg = 'Success: Called API.';
                    
                    if (type == 'json') {
                        res.json(data);
                    } else if (type == 'html') {
                        res.render('thread', {'data': data});
                    }
                
                } else {
                    msg = 'Error: No such thread.';
                    serveError(res, msg, type);
                }
                logReq(req, msg);
            });
        }
    
    } else {
        msg = 'Error: Invalid thread format.';
        serveError(res, msg, type);
        logReq(req, msg);
    }
}

function serveError(res, msg, type) {
    if (type == 'json') {
        res.json(msg);
    } else if (type == 'html') {
        res.render('thread', {'error': msg});
    }
}

function logReq(req, msg) {
    var userAgent = req.headers['user-agent'];
    var url = req.url;
    var ip = req.ip;
    
    util.log(`${url} | ${msg} | ${ip} | ${userAgent}`);
}
