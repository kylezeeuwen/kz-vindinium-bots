const Coord = require('./coord');

class Player {

  constructor(state) {
    this.state = state;
    this.pos = state.hero.pos;
    this.id = state.hero.id;
  }

  get coord() {
    return new Coord(this.pos.x, this.pos.y);
  }

  get life() {
    return this.state.hero.life;
  }
}

module.exports = Player;
