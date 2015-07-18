/*
 * Server-side JS - Main file
 */

// Environment configurables
var port = process.env.OPENSHIFT_NODEJS_PORT || 5000;
var ipaddress = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

// Dependencies
var config = require('./.config/config.json');
var request = require('request');
// var express = require('express');
// var app = express();
// var http = require('http').Server(app);

// Use files from folder 'www'
// app.use(express.static('www'));

var URL = config.url;
var TOKEN = config.token;
var TIMEOUT = config.timeout;
var QUIET = config.isQuiet;

var _updatesOffset = 0;
var _chatId = '';



//execute
setInterval(function(){
    getUpdates(processUpdates);
}, TIMEOUT*1000);






function sendMessage(msg){
    requestTelegram('sendMessage', '?chat_id='+_chatId, '&text='+msg);
}


function getUpdates(callback){
    requestTelegram('getUpdates', '', '?offset='+_updatesOffset, callback);
}


function getMe(callback){
    requestTelegram('getMe', '', '', function(){
        console.log(body);
    });
}


function parse(msg){
    var returnMessage = '';

    if(typeof msg !== "undefined" && msg.charAt(0) === '/') {
        text = msg.split(' ');
        command = text[0];

        if(command == '/start' || command == '/help'){
            returnMessage += '/roll x - to obtain a number between 1 and x (eg. /roll 6)\n';
            returnMessage += '/help to see this message again';
        }
        else if(command == '/ksami'){
            returnMessage = 'ksami is cool, ksami is great, ksami is rated ten out of eight';
        }
        else if(command == '/haha'){
            returnMessage = 'Haha yourself';
        }
        else if(command == '/roll'){
            var max = parseInt(text[1]);

            if(!isNaN(max) && max >= 1){
                returnMessage = 'Rolling a ' + max + '-sided die...\n';
                returnMessage += 'Result is: ';
                returnMessage += (Math.floor((Math.random() * max) + 1)).toString();
            }
            else{
                returnMessage = 'Please enter a number more than 0 (eg. /roll 6)';
            }
        }
    }
    return returnMessage;
}


function processUpdates(body){
    for (var i = 0; i < body.result.length; i++) {
        var update = body.result[i];

        if(update.update_id >= _updatesOffset){
            _updatesOffset = update.update_id + 1;
        }

        if(update.hasOwnProperty('message')){
            _chatId = update.message.chat.id;

            if(update.message.hasOwnProperty('text')){
                var reply = parse(update.message.text);
                sendMessage(reply);
            }
            else{
                throw new Error('no text');
            }
        }
        else{
            //no message
        }

    }
}


function requestTelegram(method, chatIdStr, param, callback){
    var cb = callback || function(body){ if(!QUIET) console.log(body); };
    var req = URL + TOKEN + '/' + method + chatIdStr + param;

    // Request to Telegram API
    request({
        method: 'GET',
        url: req,
        json: true
    }, function(err, res, body){
        try{
            if(!err && res.statusCode == 200){
                if(body.ok){
                    
                    cb(body);
                    
                }
                else{
                    throw new Error('body not ok');
                }   
            }
            else{
                if(err){
                    throw new Error(err.toString());
                }
                else{
                    throw new Error('response code is ' + res.statusCode);
                }
            }
        }
        catch(e){
            console.log('Error: ' + e.message);
        }
    });
}


// // Listen to <port>
// http.listen(port, ipaddress, function(){
//     console.log('listening on ' + ipaddress + ':' + port);
// });

// // Route handlers
// app.get('/',function(req, res){
//     res.send('Hi there!');
// });
