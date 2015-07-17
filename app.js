/*
 * Server-side JS - Main file
 */

// Environment configurables
var port = process.env.OPENSHIFT_NODEJS_PORT || 5000;
var ipaddress = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

// Dependencies
var config = require('./.config/config.json');
var request = require('request');
var express = require('express');
var app = express();
var http = require('http').Server(app);

// Use files from folder 'www'
// app.use(express.static('www'));

var URL = 'https://api.telegram.org/bot';
var TOKEN = config.token;
var _methods = ['getMe', 'getUpdates'];
var _updatesOffset = 0;

function parse(msg){
    var returnMessage = '';

    if(typeof msg !== "undefined" && msg.charAt(0) === '/') {
        text = msg.split(' ');
        command = text[0];

        if(command == '/start'){
            returnMessage = 'Welcome! This is a weird bot!';
        }
        else if(command == '/help'){
            returnMessage = 'Use /help to obtain a list of commands';
        }
        else if(command == '/haha'){
            returnMessage = 'Haha yourself';
        }
    }
    return returnMessage;
}



//TODO: stopped here, next step to send a message
requestTelegram(_methods[1], function(err, body){
    try{
        if(!err){
            console.log(body);
            if(body.ok){
                for (var i = 0; i < body.result.length; i++) {
                    var update = body.result[i];
                    _updatesOffset = update.update_id;

                    if(update.hasOwnProperty('message')){
                        if(update.message.hasOwnProperty('text')){
                            console.log(parse(update.message.text));
                        }
                        else{
                            throw 'Error: no text';
                        }
                    }
                    else{
                        throw 'Error: no message';
                    }

                }
            }
            else{
                throw 'Error: body.ok false';
            }
        }
        else{
            console.log(err);
        }
    }
    catch(e){
        console.log(e);
    }
});


function requestTelegram(method, callback){
    var req = URL + TOKEN + '/' + method;

    // Request to Telegram API
    request({
        method: 'GET',
        url: req,
        json: true
    }, function(err, res, body){
        if(!err && res.statusCode == 200){
            callback(null, body);
        }
        else{
            callback(err, body);
        }
    });
}


// Listen to <port>
http.listen(port, ipaddress, function(){
    console.log('listening on ' + ipaddress + ':' + port);
});

// Route handlers
app.get('/',function(req, res){
    res.send('Hello World');
});
