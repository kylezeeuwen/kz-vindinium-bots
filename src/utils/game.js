const _ = require('lodash')
const Coord = require('./coord')

class Game {

  static get objectives() {
    return ['hero', 'tavern', 'free_mine', 'owned_mine']
  }

  constructor(state) {
    this.game = state.game
    this.id = state.hero.id
    this.size = this.game.board.size
    this.tiles = this.game.board.tiles
    this.turn = this.game.turn
    this.maxTurns = this.game.maxTurns

    this.objectives = {
      // TODO build based on static objectives
      hero: [],
      tavern: [],
      free_mine: [],
      my_mine: [],
      owned_mine: [],
    }

    this.mapKey = {
      '##': 'wood',
      '@1': (this.id === 1) ? 'me' : 'hero',
      '@2': (this.id === 2) ? 'me' : 'hero',
      '@3': (this.id === 3) ? 'me' : 'hero',
      '@4': (this.id === 4) ? 'me' : 'hero',
      '[]': 'tavern',
      '$-': 'free_mine',
      '$1': (this.id === 1) ? 'my_mine' : 'owned_mine',
      '$2': (this.id === 2) ? 'my_mine' : 'owned_mine',
      '$3': (this.id === 3) ? 'my_mine' : 'owned_mine',
      '$4': (this.id === 4) ? 'my_mine' : 'owned_mine',
      '  ': 'empty_space'
    }

    this._buildGrid()
    this._identifyObjectives()
    this.processHeroesData()
  }

  processHeroesData () {
    this.enemies = {}
    _(this.game.heroes)
      .filter((heroData) => { return heroData.id !== this.id })
      .each((enemyData) => {
         this.enemies[enemyData.id] = enemyData
      })
  }

  iHaveSword () {
    return this.game.hero.powerUp
  }


  _buildGrid() {
    this.grid = _.chunk(this.tiles.split(''), this.size*2)
    this.grid = this.grid.map( (row) => {
      return _.chunk(row, 2).map( (cellDigraph) => cellDigraph.join(''))
    })
  }

  get goldCount() {
    return this.game.heroes.map( (hero) => {
      return `${hero.name}: ${hero.gold}`
    }).join(', ')
  }

  getCellContents(coord) {
    return this.grid[coord.x][coord.y]
  }

  getCellType(coord) {
    return this.mapKey[this.getCellContents(coord)]
  }

  isTraversibleCell(coord) {
    return ['empty_space', 'hero', 'me'].includes(this.getCellType(coord))
  }

  getObjectiveCoords(objectiveType) {
    return this.objectives[objectiveType]
  }

  _identifyObjectives() {

    _(this.grid).forEach((row, rowIndex) => {
      _(row).forEach((cell, columnIndex) => {
        if (!_.has(this.mapKey, cell)) {
          console.error(`unidentified cell: ${cell}`)
        }
        else {
          _(Game.objectives).forEach( (objective) => {
            if (this.mapKey[cell] == objective) {
              this.objectives[objective].push({
                coord: new Coord(rowIndex, columnIndex),
                cell: cell
              })
            }
          })
        }
      })
    })
  }

  printObjectives() {
    _(this.objectives).forEach( (coords, objectiveType) => {
      const objectString = _(coords).map( (c) => c.coord.name)
      console.log(`${objectiveType}: ${objectString}`)
    })
  }

  printGrid() {
    const borderString = _.range(this.size*2+2).map(() => "-").join('')
    console.log(borderString)
    _(this.grid).forEach((row) => {
      console.log(`|${row.join('')}|`)
    })
    console.log(borderString)
  }
}

module.exports = Game
