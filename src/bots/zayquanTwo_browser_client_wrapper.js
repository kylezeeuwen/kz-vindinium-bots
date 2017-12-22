const ZayquanTwo = require('./zayquanTwo')
const zayquanTwo = new ZayquanTwo()

module.exports = {
  move: (state) => {
    const nextMove = zayquanTwo.takeTurnSync(state)
    return nextMove
  }
}