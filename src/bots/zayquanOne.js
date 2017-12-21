
const _ = require('lodash');

const ClosestAccessible = require('../utils/closestAccessible');
const Game = require('../utils/game');
const Player = require('../utils/player');

class ZayquanOne {

  constructor() {
    this.defaultMove = 'f';
    this.currentObjective = null;
  }

  get randomMove() {
    var dirs = 'nesw';
    var i = Math.floor(Math.random() * 4);
    return dirs[i];
  }

  selectNewObjective() {

    if (this.player.life < 60) {
      const tavern = this.gotoNearestX('tavern');
      if (tavern) {
        return true;
      }
    }

    const freeMines = this.game.getObjectiveCoords('free_mine');
    const ownedMines = this.game.getObjectiveCoords('owned_mine');
    const nearestMine = this.gotoNearestOfTheseObjectives(freeMines.concat(ownedMines), 'not_my_mines');
    if (nearestMine) {
      return true;
    }

    return false;
  }

  gotoNearestX(objectiveType) {
    const ca = new ClosestAccessible(this.player.coord, this.game, this.game.getObjectiveCoords(objectiveType));
    const closestObjective = ca.getClosestObjective();

    if (closestObjective) {
      this.currentObjective = closestObjective;
      console.log(`chose new ${objectiveType} objective`);
      console.log(closestObjective);
      return true;
    }
    else {
      console.log(`no accessible ${objectiveType}!`);
      return false;
    }
  }

  gotoNearestOfTheseObjectives(objectives, collectionName) {
    const ca = new ClosestAccessible(this.player.coord, this.game, objectives);
    const closestObjective = ca.getClosestObjective();

    if (closestObjective) {
      this.currentObjective = closestObjective;
      console.log(`chose new ${collectionName} objective`);
      console.log(closestObjective);
      return true;
    }
    else {
      console.log(`no accessible ${collectionName}!`);
      return false;
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

  isACurrentObjective() {
    return this.currentObjective && this.currentObjective.path.length > 0;
  }

  takeTurnSync(state) {
    console.log('start turn');
    // const thresholdTimeout = setTimeout( () => {
    //   console.log("timeout threshold kicked in");
    //   delete this.currentObjective;
    //   callback(null, this.randomMove);
    // }, 750);

    const t0 = Date.now();
    try {
      if (state.game.turn === 0) {
        console.log("view URL: ", state.viewUrl);
        console.log("play URL: ", state.playUrl);
      }

      this.state = state;
      this.player = new Player(this.state);
      this.game = new Game(this.state);
      // this.game.printGrid();

      if (!this.didPlayerMove() && !this.lastDecision != 'f') {
        console.error(`Player didnt move! Last decision: ${this.lastDecision} last position: ${this.lastPosition.name}`);
      }

      if (!this.isACurrentObjective()) {
        this.selectNewObjective();
      }

      let nextMove = null;
      if (this.isACurrentObjective()) {
        const immediateDest = this.currentObjective.path.shift();
        nextMove = this.advancePath(immediateDest);

        console.log(this.game.goldCount);
        console.log([
          `life: ${this.player.life}`,
          `current: ${this.player.coord.name}`,
          `nextMove: ${immediateDest.name}`,
          `direction: ${nextMove}`,
          `objective: ${_.get(this,'currentObjective.objective.coord.name')}`,
          `duration: ${Date.now() - t0}`
        ].join(' '));
      }
      else {
        console.log("no objective!");
        nextMove = this.randomMove;
      }

      this.recordLastPosition();
      this.recordLastDecision(nextMove);
      // clearTimeout(thresholdTimeout);
      console.log(`calling callback with ${nextMove}`);
      return nextMove
    }
    catch(e) {
      console.error("Runtime Error!");
      console.error(e);
      // clearTimeout(thresholdTimeout);
      console.log('calling callback');
      return this.randomMove;
    }
  }

  takeTurn(state, callback) {
    const move = this.takeTurnSync(state)
    callback(null, move)
  }
}

module.exports = ZayquanOne;
