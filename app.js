/*
 * Server-side JS - Main file
 */

// Environment configurables
var port = process.env.OPENSHIFT_NODEJS_PORT || 5000;
var ipaddress = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

// Dependencies
var config = require((process.env.OPENSHIFT_DATA_DIR || __dirname) + '/.config/config.json');
var Tbot = require('./Tbot');
var meetup = require('./meetup');

var express = require('express');
var app = express();
var http = require('http').Server(app);

// Use files from folder 'www'
// app.use(express.static('www'));

// Listen to <port>
http.listen(port, ipaddress, function(){
    console.log('listening on ' + ipaddress + ':' + port);
});

// Route handlers
app.get('/',function(req, res){
    res.send('Hi there!');
});


// Execute
var meetupBot = new Tbot(config['meetup'], meetup.parse, meetup.STRINGS);
 
var ksamiBot = new Tbot(config['ksami'], function(message){
    var msg = message.text;
    var returnMessage = '';

    if(typeof msg !== 'undefined' && msg.charAt(0) === '/') {
        text = msg.split(' ');
        command = text[0];

        if(command == '/start' || command == '/help'){
            returnMessage += '/roll x - to obtain a number between 1 and x (eg. /roll 6)\n';
            returnMessage += '/help to see this message again';
        }
        else if(command == '/ksami'){
            returnMessage += 'ksami is cool, ksami is great, ksami is rated ten out of eight';
        }
        else if(command == '/haha'){
            returnMessage += 'Haha yourself';
        }
        else if(command == '/roll'){
            var max = parseInt(text[1]);

            if(!isNaN(max) && max >= 1){
                returnMessage += 'Rolling a ' + max + '-sided die...\n';
                returnMessage += 'Result is: ';
                returnMessage += (Math.floor((Math.random() * max) + 1)).toString();
            }
            else{
                returnMessage += 'Please enter a number more than 0 (eg. /roll 6)';
            }
        }
        else{
            //unknown command
        }
    }
    return returnMessage;
});


setInterval(function(){
    meetupBot.getUpdates();
}, meetupBot.TIMEOUT*1000);

setInterval(function(){
    ksamiBot.getUpdates();
}, ksamiBot.TIMEOUT*1000);
