
const _ = require('lodash');
const Coord = require('./coord');
const Game = require('./game');

class EnemyDetector {

  constructor (game) {
    this.game = game;
  }

  getEnemiesWithin (distance, enemies = this.game.enemies) {
    const myPosition = this.game.hero.coord
    return _(enemies)
      .filter(enemy => {
        return myPosition.absoluteDistanceFrom(enemy.coord) <= distance
      })
      .value()
  }

  getEnemiesWeakerThan (lifeThreshold, enemies = this.game.enemies) {
    return _(enemies)
      .filter(enemy => {
        return enemy.life <= lifeThreshold
      })
      .value()
  }

  getEnemiesStrongerThan (lifeThreshold, enemies = this.game.enemies) {
    return _(enemies)
      .filter(enemy => {
        return enemy.life >= lifeThreshold
      })
      .value()
  }

  getEnemiesWithAtLeastThisMuchGold (goldThreshold, enemies = this.game.enemies) {
    return _(enemies)
      .filter(enemy => {
        return enemy.gold >= goldThreshold
      })
      .value()
  }

  getEnemiesWithAtLeastThisManyGoldMines (goldMineThreshold, enemies = this.game.enemies) {
    return _(enemies)
      .filter(enemy => {
        return enemy.mineCount >= goldMineThreshold
      })
      .value()
  }
}

module.exports = EnemyDetector;
