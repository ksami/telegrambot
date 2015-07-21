module.exports.STRINGS = {
    HELP : 'Use /newmeetup to start planning a new meetup\n' + 
            '/view - view choices for the meetup\n' +
            '/respond time [t1,t2...] place [p1,p2...] - to respond (eg. /respond time 1,3,4 place 1,2)\n' +
            '/results - to see results\n' +
            '/cancel - cancel creation of the new meetup\n' +
            '/end - stop accepting responses and display results\n' +
            '/help - view list of commands\n\n' +
            'Rate this bot at https://telegram.me/storebot?start=meetup_bot',
    TITLE : 'Please enter a title for the meetup',
    DONE : 'Done! Waiting for responses...',
    RESPOND : 'Received response from ',
    VIEW :  '/view - view options for the meetup\n' +
            '/respond time [t1,t2...] place [p1,p2...] - to respond (eg. /respond time 1,3,4 place 1,2)\n' +
            '/results - to see results\n' +
            '/end - stop accepting responses and display results',
    CANCEL : 'Operation cancelled',
    END : 'No more responses will be accepted, displaying results',
    TIME : {
        FIRST : 'Please enter a date/time for the meeting',
        AGAIN : 'Please enter another date/time for the meeting or use /next to enter choices for places'
    },
    PLACE : {
        FIRST : 'Please enter a place for the meeting',
        AGAIN : 'Please enter another place for the meeting or use /next to finish'
    },
    ERROR : {
        CREATOR : 'Only the creator of the meetup is allowed to add/modify details',
        ONE : 'Only one meetup is allowed to be in progress, use /cancel to cancel creation or /end to stop accepting responses and display results',
        NAN : 'Please enter numbers belonging to one of the options',
        FORMAT: 'Please follow the format /respond time [t1,t2...] place [p1,p2...]\n' +
                '(eg. /respond time 1,3,4 place 1,2)'
    }
};


// Parses text and returns the corresponding reply
//params:
//message - Message object containing the text
module.exports.parse = function(message){
    
    var msg = message.text;
    var returnMessage = '';

    if(typeof msg !== 'undefined') {
        text = msg.split(' ');
        command = text[0].split('@')[0];


        if(command == '/start' || command == '/help'){
            returnMessage += this.STRINGS.HELP;
        }
        else if(command == '/newmeetup'){
            if(!(this.state.hasOwnProperty('meetups'))){
                this.state.meetups = {};
            }

            //if this chat has never run /newmeetup before
            if(!(this.state.meetups.hasOwnProperty(message.chat.id))){
                this.state.meetups[message.chat.id] = {
                    creator: message.from.id,
                    isOngoing: false,
                    isCreating: true,
                    isTime: false,
                    isPlace: false,
                    title: '',
                    times: [],
                    places: [],
                };

                this.state.meetups[message.chat.id].viewDetails = function(){
                    var returnText = '';

                    returnText += this.title;
                    returnText += '\n-----';
                    returnText += '\nTimes:';
                    for(var i=0; i<this.times.length; i++){
                        returnText += '\n' + (i+1) + '. ' + this.times[i].text;
                    }
                    returnText += '\n';
                    returnText += '\nPlaces:';
                    for(var j=0; j<this.places.length; j++){
                        returnText += '\n' + (j+1) + '. ' + this.places[j].text;
                    }

                    return returnText;
                };

                this.state.meetups[message.chat.id].viewResults = function(){
                    var returnText = '';

                    //find max
                    var maxTime = (Object.keys(this.times[0].votes)).length;
                    var maxPlace = (Object.keys(this.places[0].votes)).length;

                    for(var i=1; i<this.times.length; i++){
                        if((Object.keys(this.times[i].votes)).length > maxTime){
                            maxTime = (Object.keys(this.times[i].votes)).length;
                        }
                    }
                    for(var j=1; j<this.places.length; j++){
                        if((Object.keys(this.places[j].votes)).length > maxPlace){
                            maxPlace = (Object.keys(this.places[j].votes)).length;
                        }
                    }

                    //format
                    returnText += this.title;
                    returnText += '\n-----';
                    returnText += '\nTimes:';
                    for(var i=0; i<this.times.length; i++){
                        var votes = Object.keys(this.times[i].votes);
                        var emphasis = '';
                        if(votes.length == maxTime){
                            emphasis = '**';
                        }

                        returnText += '\n' + (i+1) + '. ' + this.times[i].text +
                                        ' (' + emphasis + votes.length + ' votes' +
                                            emphasis + '): ';
                        for(var k=0; k<votes.length; k++){
                            if(k>0){
                                returnText += ', ';
                            }
                            returnText += this.times[i].votes[ votes[k] ];
                        }
                    }
                    returnText += '\n';
                    returnText += '\nPlaces:';
                    for(var j=0; j<this.places.length; j++){
                        var votes = Object.keys(this.places[j].votes);
                        var emphasis = '';
                        if(votes.length == maxPlace){
                            emphasis = '**';
                        }

                        returnText += '\n' + (j+1) + '. ' + this.places[j].text +
                                        ' (' + emphasis + votes.length + ' votes' +
                                            emphasis + '): ';
                        for(var m=0; m<votes.length; m++){
                            if(m>0){
                                returnText += ', ';
                            }
                            returnText += this.places[j].votes[ votes[m] ];
                        }
                    }

                    return returnText;
                };

                returnMessage += this.STRINGS.TITLE;
            }
            //if this chat has run /newmeetup before
            else{
                var meetup = this.state.meetups[message.chat.id];
                if(!(meetup.isOngoing && meetup.isCreating)){
                    meetup = {
                        creator: message.from.id,
                        isOngoing: false,
                        isCreating: true,
                        isTime: false,
                        isPlace: false,
                        title: '',
                        times: [],
                        places: [],
                    };

                    returnMessage += this.STRINGS.TITLE;
                }
                else{
                    //invalid state, only one meetup can be in progress
                    returnMessage += this.STRINGS.ERROR.ONE;
                }
            }
        }
        else if(command == '/next'){
            if( this.state.hasOwnProperty('meetups') &&
                this.state.meetups.hasOwnProperty(message.chat.id) &&
                this.state.meetups[message.chat.id].isCreating ){

                var meetup = this.state.meetups[message.chat.id];
                if(message.from.id == meetup.creator){
                    if(meetup.isTime){
                        //just finished all time options, going on to places
                        meetup.isTime = false;
                        meetup.isPlace = true;

                        returnMessage += this.STRINGS.PLACE.FIRST;
                    }
                    else if(meetup.isPlace){
                        //just finished all place options, done
                        meetup.isPlace = false;
                        meetup.isCreating = false;
                        meetup.isOngoing = true;

                        returnMessage += this.STRINGS.DONE;
                        returnMessage += '\n';
                        returnMessage += '\n' + meetup.viewDetails();
                        returnMessage += '\n';
                        returnMessage += '\n' + this.STRINGS.VIEW;
                    }
                    else{
                        //invalid state, should not reach ((；゜A゜))
                        returnMessage += this.STRINGS.HELP;
                    }
                }
                else{
                    //not creator
                    returnMessage += this.STRINGS.ERROR.CREATOR;
                }
            }
            else{
                //has not run /newmeetup yet
                returnMessage += this.STRINGS.HELP;
            }
        }
        else if(command == '/view'){
            if( this.state.hasOwnProperty('meetups') &&
                this.state.meetups.hasOwnProperty(message.chat.id) &&
                this.state.meetups[message.chat.id].isOngoing ){

                var meetup = this.state.meetups[message.chat.id];

                returnMessage += '\n' + meetup.viewDetails();
                returnMessage += '\n';
                returnMessage += '\n' + this.STRINGS.VIEW;
            }
            else{
                //none ongoing or has not run /newmeetup yet
                returnMessage += this.STRINGS.HELP;
            }
        }
        else if(command == '/respond'){
            if( this.state.hasOwnProperty('meetups') &&
                this.state.meetups.hasOwnProperty(message.chat.id) &&
                this.state.meetups[message.chat.id].isOngoing ){
                
                var meetup = this.state.meetups[message.chat.id];
                var userId = message.from.id;
                var userName = message.from.first_name;

                try{
                    if(text.length<5){
                        throw new Error(this.STRINGS.ERROR.FORMAT);
                    }
                    // /respond time 1,3,4 place 1,2
                    var times = text[2].split(',');
                    var places = text[4].split(',');
                    var timeOpts = [];
                    var placeOpts = [];

                    //checks
                    for(var i=0; i<times.length; i++){
                        var timeOpt = parseInt(times[i]);
                        if(isNaN(timeOpt) || timeOpt<0 || timeOpt>meetup.times.length){
                            throw new Error(this.STRINGS.ERROR.NAN);
                        }
                        //actually storing the choices deferred to below
                        //in case error occurs while parsing placeOpt
                        //then entire /respond command should fail
                        //also to check before deleting
                        timeOpts.push(timeOpt);
                    }
                    for(var j=0; j<places.length; j++){
                        var placeOpt = parseInt(places[j]);
                        if(isNaN(placeOpt) || placeOpt<0 || placeOpt>meetup.places.length){
                            throw new Error(this.STRINGS.ERROR.NAN);
                        }
                        placeOpts.push(placeOpt);
                    }

                    //deletes all user votes first
                    for(var x=0; x<meetup.times.length; x++){
                        delete meetup.times[x].votes[userId];
                    }
                    for(var y=0; y<meetup.places.length; y++){
                        delete meetup.places[y].votes[userId];
                    }

                    //store votes
                    for(var k=0; k<timeOpts.length; k++){
                        var timeOpt = timeOpts[k];
                        meetup.times[timeOpt-1].votes[userId] = userName;
                    }
                    for(var m=0; m<placeOpts.length; m++){
                        var placeOpt = placeOpts[m];
                        meetup.places[placeOpt-1].votes[userId] = userName;
                    }

                    //success
                    returnMessage += this.STRINGS.RESPOND + userName;
                }
                catch(e){
                    returnMessage += e.message;
                }
            }
            else{
                //not ongoing or has not run /newmeetup yet
                returnMessage += this.STRINGS.HELP;
            }
        }
        else if(command == '/results'){
            if( this.state.hasOwnProperty('meetups') &&
                this.state.meetups.hasOwnProperty(message.chat.id) &&
                !(this.state.meetups[message.chat.id].isCreating) ){

                var meetup = this.state.meetups[message.chat.id];

                returnMessage += '\n' + meetup.viewResults();
                returnMessage += '\n';
                returnMessage += '\n' + this.STRINGS.VIEW;
            }
            else{
                //still in creation stage or has not run /newmeetup yet
                returnMessage += this.STRINGS.HELP;
            }
        }
        else if(command == '/cancel'){
            if( this.state.hasOwnProperty('meetups') &&
                this.state.meetups.hasOwnProperty(message.chat.id) &&
                this.state.meetups[message.chat.id].isCreating ){

                if(message.from.id == this.state.meetups[message.chat.id].creator){
                    this.state.meetups[message.chat.id] = {};
                    returnMessage += this.STRINGS.CANCEL;
                }
                else{
                    //not creator
                    returnMessage += this.STRINGS.ERROR.CREATOR;
                }
            }
            else{
                //creation not in progress or has not run /newmeetup yet
                returnMessage += this.STRINGS.HELP;
            }
        }
        else if(command == '/end'){
            if( this.state.hasOwnProperty('meetups') &&
                this.state.meetups.hasOwnProperty(message.chat.id) &&
                this.state.meetups[message.chat.id].isOngoing ){

                var meetup = this.state.meetups[message.chat.id];
                meetup.isOngoing = false;

                returnMessage += this.STRINGS.END;
                returnMessage += '\n';
                returnMessage += '\n' + meetup.viewResults();
            }
            else{
                //ongoing not in progress or has not run /newmeetup yet
                returnMessage += this.STRINGS.HELP;
            }
        }
        else{
            if( this.state.hasOwnProperty('meetups') &&
                this.state.meetups.hasOwnProperty(message.chat.id) &&
                this.state.meetups[message.chat.id].isCreating ){

                var meetup = this.state.meetups[message.chat.id];
                if(message.from.id == meetup.creator){
                    if( meetup.title === '' &&
                        !(meetup.isTime) &&
                        !(meetup.isPlace) ){
                        //adding title
                        meetup.title = msg;
                        meetup.isTime = true;
                        returnMessage += this.STRINGS.TIME.FIRST;
                    }
                    else if(meetup.isTime){
                        //adding time
                        meetup.times.push({text: msg, votes: {}});
                        returnMessage += this.STRINGS.TIME.AGAIN;
                    }
                    else if(meetup.isPlace){
                        //adding place
                        meetup.places.push({text: msg, votes: {}});
                        returnMessage += this.STRINGS.PLACE.AGAIN;
                    }
                    else{
                        //invalid state, should not reach ((；゜A゜))
                        returnMessage += this.STRINGS.HELP;
                    }
                }
                else{
                    //not creator
                    returnMessage += this.STRINGS.ERROR.CREATOR;
                }

            }
            else{
                //unknown /command or has not run /newmeetup yet
                //or not a message for this bot
            }
        }
    }

    return returnMessage;
};  // /parse()