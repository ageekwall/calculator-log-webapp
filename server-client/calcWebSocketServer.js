"use strict";
// list of users connected to App
var users = [ ];
// last 10 messages
var msgHistory = [ ];
var wsPort = 5000; //Port
// creating websocket connection
var webSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
});
server.listen(wsPort, function() {
    console.log((new Date()) + " Server is listening on port " + wsPort);
});
//starting a websocket server (for two way communication between server and client)
var wsServer = new webSocketServer({
    httpServer: server
});

//callback on client connection
wsServer.on('request', function(request) {
    console.log((new Date()) +request.origin);
    var connection = request.accept(null, request.origin); 
    var index = users.push(connection) - 1;
    console.log((new Date()) + ' Connection estabilished.');
    // send back chat history to newly connected users
    if (msgHistory.length > 0) {
        connection.sendUTF(JSON.stringify( { type: 'history', data: msgHistory} ));
    }
    // user sent math expression
    connection.on('message', function(message) {
        if (message.type === 'utf8') { 
                try {
                    var ans = eval(message.utf8Data);
                    console.log((new Date()) + ' Received Message: '+ message.utf8Data +" = "+ ans);
                    var obj = {
                        time: (new Date()).getTime(),
                        text: message.utf8Data+" ="+ ans
                    };
                    //maintain history
                    msgHistory.push(obj);
                    msgHistory = msgHistory.slice(-10);
                    // send message to all connected users
                    var json = JSON.stringify({ type:'message', data: obj });
                    for (var i=0; i < users.length; i++) {
                        users[i].sendUTF(json);
                    }

                }
                catch(err) {  //in case user enters wrong math expression
                   var obj = null;
                    console.log('wrong input '+err);
                    var json = JSON.stringify({ type:'invalid', data: obj });
                    connection.sendUTF(json);  //just to the current client
                    }
                }
    });

    // user disconnected
    connection.on('close', function(connection) {
        users.splice(index, 1);
    });

});