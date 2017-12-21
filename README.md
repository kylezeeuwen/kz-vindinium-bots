# kz-vindinium-bots

Kyle's bot(s), that are written to work with the node js [vindinium-client](https://www.npmjs.com/package/vindinium-client).

Read up on vindinium at [vindinium.org](http://vindinium.org/).

Read up on the node js vindinium client that runs your bot here [vindinium-client](https://www.npmjs.com/package/vindinium-client).

Read up on the browser based vindinium client that runs your bot here [vindinium-browser-client](https://github.com/kylezeeuwen/vindinium-browser-client).

# Install

`yarn install`

## Run the bot via nodejs

Note the command line args are just picked up by [vindinium-client](https://www.npmjs.com/package/vindinium-client) and the docs for that module are more comprehensive

### Train Mode

    node runBot.js -t 1 --map m1 <CONFIG_PATH_CONTAINING_KEY_AND_SERVERURL>

### Arena Mode

Run 20 arena matches, in 4 workers, queue only 1 at the same time:

    node runBot.js -a 1,4,20 config.json

## Run the bot via browser client

To run in the browser we need to browserify our bot, then copy the bot code into the [vindinium-browser-client](https://github.com/kylezeeuwen/vindinium-browser-client) src, which must be running locally.
  
Prerequisites:

* the vindinium-browser-client is installed in the ../vindinium-browser-client directory
* if you create a new bot (not zayquanOne) then you must update the vindinium-browser-client index.html to load your browserified code, and you must modify the package.json "build" step to name your bot something different 

Steps:

* In the vindinium-browser-client run `node index.js`, then goto [http://localhost:4242](http://localhost:4242). Select the botname (this must match the name in the package.json build step)
* Any time you make changes to your bot, run the following in the "kz-vindinium-bots" directory : `yarn push_to_frontend`
