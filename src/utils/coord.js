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

  validMovesAwayFrom(coord, gridSize) {
    let deltaX = (coord.x - this.x) * -1
    let deltaY = (coord.y - this.y) * -1

    // TODO cludgy ...
    if (deltaX > 1) { deltaX = 1 }
    if (deltaX < -1) { deltaX = -1 }
    if (deltaY > 1) { deltaY = 1 }
    if (deltaY < -1) { deltaY = -1 }

    const destinations = [
      new Coord(this.x + deltaX, this.y),
      new Coord(this.x, this.y + deltaY)
    ].filter((coord) => {
      return coord.x >= 0 && coord.x < gridSize && coord.y >= 0 && coord.y < gridSize
    }).filter((coord) => {
      return this.x !== coord.x || this.y !== coord.y
    })

    return destinations
  }
}

module.exports = Coord
