# telegrambot
-----
Bot for the Telegram chat application

## Installing
1. `npm install`
2. Create `./.config/config.json` with the contents
```javascript
{
    "ksami": {
        "isQuiet": true,
        "url": "https://api.telegram.org/bot",
        "token": API_TOKEN,
        "timeout": 1
    },
    "meetup": {
        "isQuiet": true,
        "url": "https://api.telegram.org/bot",
        "token": API_TOKEN_2,
        "timeout": 1
    }
}
```
and replace `API_TOKEN` with your api tokens, one for each bot that you want  
3. Comment out the bots that you don't want in `app.js`  

## Running
1. `node app`
