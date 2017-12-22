
const _ = require('lodash');

const ClosestAccessible = require('../utils/closestAccessible');
const Game = require('../utils/game');
const Player = require('../utils/player');
const EnemyDetector = require('../utils/enemyDetector')

const log = true

class ZayquanTwo {

  static get defaultSettings() {
    return {
      healthyThreshold: 60,
      nearbyDangerousEnemyDistance: 3,
      weakerThanMeAndValuable: {
        distanceThreshold: 4,
        goldMineThreshold: 1,
        name: ' attack weakerThanMeAndValuable'
      },
      reallyWeakNearbyValuable: {
        distanceThreshold: 8,
        goldMineThreshold: 2,
        healthThreshold: 20,
        name: 'attack reallyWeakNearbyValuable'
      }
    }
  }

  constructor(settings = {}) {
    this.currentObjective = null;
    this.settings = _.defaults(settings, ZayquanTwo.defaultSettings)
  }

  get randomMove() {
    var dirs = ['WEST', 'EAST', 'NORTH', 'SOUTH'];
    var i = Math.floor(Math.random() * 4);
    return dirs[i];
  }

  selectNewObjective() {
    this.currentObjective = null

    const enemyDetector = new EnemyDetector(this.game)
    const target = enemyDetector.getEnemyWithMostGold()

    if (target) {
      const attackObjectives = _([target])
        .map((enemyData) => {
          return {
            coord: enemyData.coord,
            cell: '',
            type: `attack ${enemyData.id}(${enemyData.name})`
          }
        })
        .value()
      const objective = this.gotoNearestOfTheseObjectives(attackObjectives, 'attack')
      if (objective) {
        this.currentObjective = objective
      }
    }
  }

  gotoNearestOfTheseObjectives(objectives, collectionName) {
    const ca = new ClosestAccessible(this.player.coord, this.game, objectives);
    const closestObjective = ca.getClosestObjective();

    if (closestObjective) {
      return closestObjective
    }
    else {
      console.log(`no accessible ${collectionName}!`);
      return null
    }
  }

  advancePath(immediateDestCoord) {

    const d = immediateDestCoord;
    const c = this.player.coord;

    if (d.y - c.y === 0 && d.x - c.x === 0) { return 'STAY' }
    if (d.y - c.y === -1) { return 'WEST' }
    if (d.y - c.y === 1) { return 'EAST' }
    if (d.x - c.x === -1) { return 'NORTH' }
    if (d.x - c.x === 1) { return 'SOUTH' }

    console.log(`ERROR: cant figure out how to move to ${d.name} from ${c.name}`);
    delete this.currentObjective;
    return this.randomMove;
  }

  recordLastDecision(decision) {
    this.lastDecision = decision;
  }

  recordLastPosition() {
    this.lastPosition = _.cloneDeep(this.player.coord);
  }

  didPlayerMove() {

    if (!this.lastPosition) { return true; }

    if (this.player.coord.x === this.lastPosition.x && this.player.coord.y === this.lastPosition.y) {
      return false;
    }
    return true;
  }

  hasCurrentObjective() {
    return this.currentObjective && this.currentObjective.path.length > 0;
  }

  takeTurnSync(state) {
    const startTime = Date.now()
    let endTime = null
    let objective = ''
    try {
      if (state.game.turn === 0) {
        console.log("view URL: ", state.viewUrl)
        console.log("play URL: ", state.playUrl)
      }

      this.state = state
      this.player = new Player(this.state)
      this.game = new Game(this.state)

      if (!this.didPlayerMove() && !this.lastDecision !== 'STAY') {
        if (log) { console.error(`Player didnt move! Last decision: ${this.lastDecision} last position: ${this.lastPosition.name}`); }
      }

      this.selectNewObjective()

      let nextMove = null;
      if (this.hasCurrentObjective()) {
        const immediateDest = this.currentObjective.path.shift();
        nextMove = this.advancePath(immediateDest);
        objective = this.currentObjective.objective.type
        endTime = Date.now()
      }
      else {
        console.log("no objective!")
        endTime = Date.now()
        nextMove = this.randomMove;
      }
      if (log) { console.log(`Bot took ${endTime - startTime}ms, objective: ${objective}, move ${nextMove}`) }
      this.recordLastPosition()
      this.recordLastDecision(nextMove)

      return nextMove
    }
    catch(e) {
      console.error("Runtime Error!")
      console.error(e)
      console.log('calling callback')
      return this.randomMove
    }
  }

  takeTurn(state, callback) {

    const timeout = setTimeout(() => {
      const move = this.randomMove
      console.log(`Timeout exceeded ! Making random move`)
      callback(null, move)
    }, 900)

    const move = this.takeTurnSync(state)
    clearTimeout(timeout)
    callback(null, move)
  }
}

module.exports = ZayquanTwo;
