const TeleBot = require('telebot');
const bot = new TeleBot('593194083:AAGUm1oWDfrgG5qhvuH5gvJk-Bn8toPNhm0');

bot.on('text', (msg) => msg.reply.text(msg.text));

bot.start();