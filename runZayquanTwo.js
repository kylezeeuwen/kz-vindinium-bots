const _ = require('lodash');
const vClient = require('vindinium-client');

const botDefinition = require('./src/bots/zayquanTwo');

const bot = new botDefinition();

vClient.cli(bot.takeTurn.bind(bot));
