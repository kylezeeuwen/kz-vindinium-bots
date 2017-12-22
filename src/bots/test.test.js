const chai = require('chai');
const _ = require('lodash')

const state = require('../../scratch/states/local.json');
const botDefinition = require('./zayquanOne');

const boardSize = 4
const map = `
@1    @2
        
        
@3    @4`


const setHeroPos = (heroId, x, y, state) => {

  if (heroId === state.hero.id) {
    state.hero.pos.x = x
    state.hero.pos.y = y
  }

  _(state.game.heroes)
    .filter(heroData => heroData.id === heroId)
    .each((heroData) => {
      heroData.pos.x = x
      heroData.pos.y = y
    })
}

state.game.board.size  = boardSize
state.game.board.tiles = map.replace(/\n/g, '')
setHeroPos(1,0,0,state)
setHeroPos(2,0,3,state)
setHeroPos(3,3,0,state)
setHeroPos(4,3,3,state)

console.log('state')
console.log(JSON.stringify(state, {}, 2))

describe('test1', function() {
  it('works', function() {

    const bot = new botDefinition()
    const move = bot.takeTurnSync(state)
    console.log(`move: ${move}`);
    chai.expect(true).to.equal(true);
  })
})
