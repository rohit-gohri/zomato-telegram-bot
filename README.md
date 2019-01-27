# zomato-telegram-bot

## Start

Edit the `config.json` in the root of the folder with your set of keys/token or read the [config](#config) section.

```sh
yarn
yarn start
```

OR

```sh
npm install
npm run start
```

## config

Add a `config.json` to a folder called `private` in the root directory.

The format should be :

```json
{
  "zomato": {
      "token": "YOUR_API_TOKEN"
   },
   "telegram": {
      "token": "YOUR_BOT_TOKEN"
    }
}
```

Get Zomato API token at: https://developers.zomato.com/api
Generate Telegram bot token with @botfather bot on telegram: https://telegram.me/botfather


### API Documentation

Zomato: https://developers.zomato.com/documentation
Telegram: https://core.telegram.org/bots/api

Telegraf's inline mode docs: https://core.telegram.org/bots/api#inline-mode 
