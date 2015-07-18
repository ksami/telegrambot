var request = require('request');

function Tbot(config, parsingFunction){
    var self = this;

    this.URL = config.url;
    this.TOKEN = config.token;
    this.TIMEOUT = config.timeout;
    this.QUIET = config.isQuiet;

    this._updatesOffset = 0;
    this._chatId = '';

    //function for parsing the message
    this.parse = parsingFunction;
    //state object for storing state
    this.state = {};

    // Request to Telegram API
    //params:
    //method - one of Telegram's Bot API methods
    //chatIdStr - chatId as '?chat_id=' or offset as '?offset='
    //param - any other params eg. '&text='
    //callback - callback function
    this.sendRequest = function(method, chatIdStr, param, callback){
        var cb = callback || function(body){ if(!self.QUIET) console.log(body); };
        var req = self.URL + self.TOKEN + '/' + method + chatIdStr + param;

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
    };

    // Sends a message for each text message received
    //params:
    //body - array of Update objects
    this.processUpdates = function(body){
        for (var i = 0; i < body.result.length; i++) {
            var update = body.result[i];

            if(update.update_id >= self._updatesOffset){
                self._updatesOffset = update.update_id + 1;
            }

            if(update.hasOwnProperty('message')){
                self._chatId = update.message.chat.id;

                if(update.message.hasOwnProperty('text')){
                    var reply = self.parse(update.message.text);
                    self.sendMessage(reply);
                }
                else{
                    throw new Error('no text');
                }
            }
            else{
                //no message
            }

        }
    };
}


Tbot.prototype.getMe = function(callback){
    this.sendRequest('getMe', '', '', callback);
};

Tbot.prototype.getUpdates = function(){
    this.sendRequest('getUpdates', '', '?offset='+this._updatesOffset, this.processUpdates);
};

Tbot.prototype.sendMessage = function(msg){
    this.sendRequest('sendMessage', '?chat_id='+this._chatId, '&text='+msg);
};


module.exports = Tbot;