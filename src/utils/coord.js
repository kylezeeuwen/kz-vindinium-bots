class Coord {
  constructor(x,y) {
    this.x = parseInt(x);
    this.y = parseInt(y);
  }

  get name() {
    return `${this.x}:${this.y}`;
  }

  static fromString(input) {
    const parts = input.split(':')
    return new Coord(parts[0], parts[1]);
  }
}

module.exports = Coord;
