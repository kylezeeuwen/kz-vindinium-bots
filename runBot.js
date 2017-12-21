const _ = require('lodash');
const vClient = require('vindinium-client');

const botDefinition = require('./src/bots/zayquan_1');

const bot = new botDefinition();

vClient.cli(bot.takeTurn.bind(bot));
