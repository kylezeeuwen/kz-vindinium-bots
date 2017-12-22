
const _ = require('lodash');
const Coord = require('./coord');
const Game = require('./game');

class ClosestAccessible {

  constructor(currentCoord, game, objectives, objectiveName) {
    this.currentCoord = currentCoord;
    this.game = game;
    this.objectives = objectives;
    this.objectiveName = objectiveName
  }

  getNeighbors(coord) {
    const x = coord.x;
    const y = coord.y;

    const candidates = [
      new Coord(x,y-1),
      new Coord(x,y+1),
      new Coord(x-1,y),
      new Coord(x+1,y)
    ]

    return candidates.filter( (candidate) => {
      if (candidate.x < 0 || candidate.x >= this.game.size) { return false; }
      if (candidate.y < 0 || candidate.y >= this.game.size) { return false; }
      return true;
    })
  }

  getClosestObjective() {
    this.calcBST();

    const distances = {}
    const paths = {}
    let shortestDistance = 100000000;
    let nearestObjective = null;
    _(this.objectives).forEach( (objective) => {
      const path = this.getPathTo(objective.coord);
      if (path) {
        paths[objective.coord.name] = path;
        distances[objective.coord.name] = path.length;
        if (path.length < shortestDistance) {
          shortestDistance = path.length;
          nearestObjective = objective;
        }
      }
    })

    if (nearestObjective) {
      return {
        objective: nearestObjective,
        path: paths[nearestObjective.coord.name]
      };
    }

    else {
      console.log(`no nearest ${this.objectiveName} objective`);
      // console.log("objectives");
      // console.log(JSON.stringify(this.objectives, {}, 2));
      //
      // console.log("parents");
      // console.log(JSON.stringify(this.parents, {}, 2));
      //
      // console.log("cellStates");
      // console.log(JSON.stringify(this.cellStates));
    }

    return null;

  }

  getPathTo(dst) {

    if (!_.has(this.parents, dst.name)) {
      // console.log('fail to launch')
      return null;
    }

    let path = [dst];
    let current = dst.name;
    while (this.parents[current] !== this.currentCoord.name && this.parents[current] != dst.name) {
      path.unshift(Coord.fromString(this.parents[current]));
      current = this.parents[current];
      // console.log(`new current ${current} and currents parent: ${this.parents[current]}`);
    }
    return path;
  }

  calcBST() {
    let queue = [this.currentCoord];
    this.cellStates = [];
    this.parents = {};

    const getCellStatus = (coord) => {
      return this.cellStates[coord.x][coord.y];
    }

    const setCellStatus = (coord, value) => {
      this.cellStates[coord.x][coord.y] = value;
    }

    const setParent = (child, parent) => {
      this.parents[child.name] = parent.name;
    }

    _.range(this.game.size).forEach( () => {
      const rowOfUnprocessed = _.range(this.game.size).map( () => 'U');
      this.cellStates.push(rowOfUnprocessed);
    });

    while (queue.length > 0) {
      // console.log(this.cellStates);
      const candidate = queue.shift();
      // console.log(`candidate: ${candidate.name}`);
      setCellStatus(candidate, 'D')
      const neighbors = this.getNeighbors(candidate);
      // console.log(neighbors);

      _(neighbors).forEach( (neighbor) => {
        if (getCellStatus(neighbor) === 'D') {
          return;
        }
        setCellStatus(neighbor, 'D');
        setParent(neighbor, candidate);

        if (this.game.isTraversibleCell(neighbor)) {
          queue.push(neighbor);
        }
      })
    }
  }
}

module.exports = ClosestAccessible;
