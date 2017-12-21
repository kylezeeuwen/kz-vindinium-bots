const ZayquanOne = require('./zayquanOne')
const zayquanOne = new ZayquanOne()

module.exports = {
  move: (state) => {
    console.log(`wrapper: calling zayquanOne.takeTurnSync`)
    const nextMove = zayquanOne.takeTurnSync(state)
    console.log(`wrapper: takeTurnSync() returns ${nextMove}`)
    return nextMove
  }
}