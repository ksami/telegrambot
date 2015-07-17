/*
 * Server-side JS - Main file
 */

// Environment configurables
var port = process.env.OPENSHIFT_NODEJS_PORT || 5000;
var ipaddress = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

// Dependencies
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
    res.send('Hello World');
});

