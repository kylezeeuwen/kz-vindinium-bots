const ZayquanOne = require('./zayquanOne')
const zayquanOne = new ZayquanOne()

module.exports = {
  move: (state) => {
    const nextMove = zayquanOne.takeTurnSync(state)
    return nextMove
  }
}