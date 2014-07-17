var http = require('http');
var path = require('path');
var socketio = require('socket.io');
var express = require('express');
var easyrtc = require("easyrtc");
var app = express();

var server = http.createServer(app);
var socketServer = socketio.listen(server, {"log level":1});
var rtcServer = easyrtc.listen(app, socketServer);

app.use(express.static(path.resolve(__dirname, 'client')));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

var expressServer = server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
    var addr = server.address();
    console.log("Chat server listening at", addr.address + ":" + addr.port);
});