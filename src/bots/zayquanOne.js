
const _ = require('lodash');

const ClosestAccessible = require('../utils/closestAccessible');
const Game = require('../utils/game');
const Player = require('../utils/player');
const EnemyDetector = require('../utils/enemyDetector')

class ZayquanOne {

  static get defaultSettings() {
    return {
      healthyThreshold: 60,
      nearbyEnemyDistance: 3
    }
  }

  constructor(settings = {}) {
    this.currentObjective = null;
    this.settings = _.defaults(settings, ZayquanOne.defaultSettings)
  }

  get randomMove() {
    var dirs = ['WEST', 'EAST', 'NORTH', 'SOUTH'];
    var i = Math.floor(Math.random() * 4);
    return dirs[i];
  }

  selectNewObjective() {
    this.currentObjective = null

    if (this.player.life < this.settings.healthyThreshold) {
      const tavern = this.gotoNearestX('tavern')
      if (tavern) {
        this.currentObjective = tavern;
        return true
      }
    }

    const runAwayInThisDirection = this.someoneNearbyCanKillMeSoRunAway()
    if (runAwayInThisDirection) {
      this.currentObjective = runAwayInThisDirection
      return true
    }

    const nearbyValuableTargetsInThisDirection = this.someoneValuableAndWeakNearbySoKillThem()
    if (nearbyValuableTargetsInThisDirection) {
      this.currentObjective = nearbyValuableTargetsInThisDirection
      return true
    }

    const freeMines = this.game.getObjectiveCoords('free_mine')
    const ownedMines = this.game.getObjectiveCoords('owned_mine')
    const nearestMine = this.gotoNearestOfTheseObjectives(freeMines.concat(ownedMines), 'not_my_mines')
    if (nearestMine) {
      this.currentObjective = nearestMine
      return true
    }

    return false
  }

  // return objective with path
  someoneNearbyCanKillMeSoRunAway () {

    const enemyDetector = new EnemyDetector(this.game)
    const nearbyEnemies = enemyDetector.getEnemiesWithin(this.settings.nearbyEnemyDistance)
    const nearbyDangerousEnemies = enemyDetector.getEnemiesStrongerThan(this.game.hero.life, nearbyEnemies)

    if (nearbyDangerousEnemies) {
      const coords = []
      const myCoord = this.game.hero.coord
      const coordsToRunTo = _(nearbyDangerousEnemies)
        .map((nearbyEnemy) => {
          return myCoord.validMovesAwayFrom(nearbyEnemy.coord, this.game.gridSize)
        })
        .flatten()
        .filter((coord) => this.game.isTraversibleCell(coord))
        .value()

      if (coordsToRunTo.length > 0) {

        return {
          objective: {
            coord: coordsToRunTo[0],
            cell: '',
            type: 'run away'
          },
          path: [
            coordsToRunTo[0]
          ]
        }
      }

    }
    return null
  }

  // return objective with path
  someoneValuableAndWeakNearbySoKillThem() {
    return null
  }


  gotoNearestX(objectiveType) {
    const ca = new ClosestAccessible(this.player.coord, this.game, this.game.getObjectiveCoords(objectiveType), objectiveType)
    const closestObjective = ca.getClosestObjective()

    if (closestObjective) {
      return closestObjective
    }
    else {
      console.log(`no accessible ${objectiveType}!`)
      return null
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

    const t0 = Date.now()
    try {
      if (state.game.turn === 0) {
        console.log("view URL: ", state.viewUrl)
        console.log("play URL: ", state.playUrl)
      }

      this.state = state
      this.player = new Player(this.state)
      this.game = new Game(this.state)

      if (!this.didPlayerMove() && !this.lastDecision !== 'STAY') {
        console.error(`Player didnt move! Last decision: ${this.lastDecision} last position: ${this.lastPosition.name}`);
      }

      this.selectNewObjective()

      let nextMove = null;
      if (this.hasCurrentObjective()) {
        console.log(`Current objective is ${this.currentObjective.objective.type}`)
        const immediateDest = this.currentObjective.path.shift();
        nextMove = this.advancePath(immediateDest);

        // console.log(this.game.goldCount)
        // console.log([
        //   `life: ${this.player.life}`,
        //   `current: ${this.player.coord.name}`,
        //   `nextMove: ${immediateDest.name}`,
        //   `direction: ${nextMove}`,
        //   `objective: ${_.get(this,'currentObjective.objective.coord.name')}`,
        //   `duration: ${Date.now() - t0}`
        // ].join(' '))
      }
      else {
        console.log("no objective!")
        nextMove = this.randomMove;
      }

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
    const move = this.takeTurnSync(state)
    callback(null, move)
  }
}

module.exports = ZayquanOne;
