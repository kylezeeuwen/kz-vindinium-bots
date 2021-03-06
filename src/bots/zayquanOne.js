
const _ = require('lodash');

const ClosestAccessible = require('../utils/closestAccessible');
const Game = require('../utils/game');
const Player = require('../utils/player');
const EnemyDetector = require('../utils/enemyDetector')

const log = false

class ZayquanOne {

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
    this.settings = _.defaults(settings, ZayquanOne.defaultSettings)
  }

  get randomMove() {
    var dirs = ['WEST', 'EAST', 'NORTH', 'SOUTH'];
    var i = Math.floor(Math.random() * 4);
    return dirs[i];
  }

  selectNewObjective() {
    this.currentObjective = null

    if (this.player.life < this.settings.healthyThreshold && this.game.hero.gold >= 2) {
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

    const reallyWeakNearbyValuableTargets = this.someoneValuableAndWeakNearbySoKillThem(this.settings.reallyWeakNearbyValuable)
    if (reallyWeakNearbyValuableTargets) {
      this.currentObjective = reallyWeakNearbyValuableTargets
      return true
    }

    const weakerThanMeNearbyValuableTargets = this.someoneValuableAndWeakNearbySoKillThem(this.settings.weakerThanMeAndValuable)
    if (weakerThanMeNearbyValuableTargets) {
      this.currentObjective = weakerThanMeNearbyValuableTargets
      return true
    }

    const freeMines = this.game.getObjectiveCoords('free_mine')
    const ownedMines = this.game.getObjectiveCoords('owned_mine')
    const nearestMine = this.gotoNearestOfTheseObjectives(freeMines.concat(ownedMines), 'not_my_mines')
    if (nearestMine) {
      this.currentObjective = nearestMine
      return true
    }

    const eliminateCompetition = this.eliminateCompetition(this.game.hero.gold)
    if (eliminateCompetition) {
      this.currentObjective = eliminateCompetition
      return true
    }

    return false
  }

  // return objective with path or NULL
  someoneNearbyCanKillMeSoRunAway () {

    const enemyDetector = new EnemyDetector(this.game)
    const nearbyEnemies = enemyDetector.getEnemiesWithin(this.settings.nearbyDangerousEnemyDistance)
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

  // return objective with path or NULL
  someoneValuableAndWeakNearbySoKillThem({ name, distanceThreshold, goldMineThreshold, healthThreshold = this.game.myHealth }) {
    const enemyDetector = new EnemyDetector(this.game)
    const nearbyEnemies = enemyDetector.getEnemiesWithin(distanceThreshold)
    const nearbyWeakEnemies = enemyDetector.getEnemiesWeakerThan(healthThreshold, nearbyEnemies)
    const nearbyWeakValuableEnemies = enemyDetector.getEnemiesWithAtLeastThisManyGoldMines(goldMineThreshold, nearbyWeakEnemies)

    if (nearbyWeakValuableEnemies.length > 0) {
      const attackObjectives = _(nearbyWeakValuableEnemies)
        .map((enemyData) => {
          return {
            coord: enemyData.coord,
            cell: '',
            type: `${name} : ${enemyData.id}(${enemyData.name})`
          }
        })
        .value()
      const target = this.gotoNearestOfTheseObjectives(attackObjectives, name)
      if (target) {
        return target
      }
    }

    return null
  }

  eliminateCompetition(goldThreshold) {
    const name = 'eliminate competition'
    const enemyDetector = new EnemyDetector(this.game)
    const competition = enemyDetector.getEnemiesWithAtLeastThisMuchGold(goldThreshold)

    if (competition.length > 0) {
      const attackObjectives = _(competition)
        .map((enemyData) => {
          return {
            coord: enemyData.coord,
            cell: '',
            type: name
          }
        })
        .value()
      const target = this.gotoNearestOfTheseObjectives(attackObjectives, name)
      if (target) {
        return target
      }
    }

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

module.exports = ZayquanOne;
