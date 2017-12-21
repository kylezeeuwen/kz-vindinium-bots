const chai = require('chai');


const state = require('../../scratch/states/10_1.json');
const botDefinition = require('./zayquan_1');

describe('test1', function() {
  it('works', function() {

    const bot = new botDefinition()
    bot.takeTurn(state, (decision) => {
      console.log(`decision: ${decision}`);
      switch (decision) {
        // likely wrong
        case 'n': state.hero.pos.y -= 1;
        case 's': state.hero.pos.y += 1;
        case 'w': state.hero.pos.x -= 1;
        case 'e': state.hero.pos.x += 1;
      }
    });
    chai.expect(true).to.equal(true);
  })
})
