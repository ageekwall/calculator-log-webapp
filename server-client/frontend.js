$(function () {
    "use strict";
    var content = $('#content');
    var input = $('#input');
    var status = $('#status');
    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    // if browser doesn't support WebSocket, just show some notification and exit
    if (!window.WebSocket) {
        content.html($('<p>', { text: 'Sorry, but your browser doesn\'t '
                                    + 'support WebSockets.'} ));
        input.hide();
        $('span').hide();
        return;
    }

    // open connection
    var connection = new WebSocket('ws://127.0.0.1:5000');

    // connection.onopen = function () {
    //     // first we want users to enter their names
    //     input.removeAttr('disabled');
    //     status.text('');
    // };

    connection.onerror = function (error) {
        // just in there were some problems with conenction...
        content.html($('<p>', { text: 'connection or the server is down.' } )); 
    };

    // most important part - incoming messages
    connection.onmessage = function (message) {
        var json = JSON.parse(message.data);
        if (json.type === 'history') { // entire message history to every client
            for (var i=0; i < json.data.length; i++) {
                prependExpr(json.data[i].text,
                         new Date(json.data[i].time));
            }
        } else if (json.type === 'message') { // single message to every client
            input.removeAttr('disabled'); 
            prependExpr( json.data.text,
                       new Date(json.data.time));
        } else { //invalid expression
           input.removeAttr('disabled').val('Invalid Expression, try again!');
            console.log('Invalid Expression: ', json);
        }
    };

    /**
     * Send mesage when user presses Enter key
     */
    input.keydown(function(e) {
        if (e.keyCode === 13) {
            var msg = $(this).val();
            if (!msg) {
                return;
            }
            connection.send(msg);
            $(this).val('');
            input.attr('disabled', 'disabled');
        }
    });

   //ping server every 3 sec for health
    setInterval(function() {
        if (connection.readyState !== 1) {
            status.text('Error');
            input.attr('disabled', 'disabled').val('Unable to comminucate '
                                                 + 'with the WebSocket server.');
        }
    }, 3000);

    // prepend message to show descending messages
    function prependExpr(message, date) {
        content.prepend('<p>'
             +  message + '</p>');
    }
    
});