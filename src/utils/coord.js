class Coord {
  constructor(x,y) {
    this.x = parseInt(x);
    this.y = parseInt(y);
  }

  get name() {
    return `${this.x}:${this.y}`;
  }

  static fromPos(pos) {
    return new Coord(pos.x, pos.y)
  }

  static fromString(input) {
    const parts = input.split(':')
    return new Coord(parts[0], parts[1]);
  }

  absoluteDistanceFrom(coord) {
    return Math.abs(this.x - coord.x) + Math.abs(this.y - coord.y)
  }
}

module.exports = Coord;
