planetoidimport Ray from './Ray';
import { planetoidVertices, arbitraryNumberBetween } from './gameHelpers';

export default class Planetoid {
  constructor(args) {
    this.position = args.position
    this.velocity = {
      x: arbitraryNumberBetween(-1.5, 1.5),
      y: arbitraryNumberBetween(-1.5, 1.5)
    }
    this.rotation = 0;
    this.rotationSpeed = arbitraryNumberBetween(-1, 1)
    this.radius = args.size;
    this.score = (80/this.radius)*5;
    this.create = args.create;
    this.addScore = args.addScore;
    this.vertices = planetoidVertices(8, args.size)
  }

  annihilate(){
    this.delete = true;
    this.addScore(this.score);

    // Explode
    for (let i = 0; i < this.radius; i++) {
      const ray = new Ray({
        lifeSpan: arbitraryNumberBetween(60, 100),
        size: arbitraryNumberBetween(1, 3),
        position: {
          x: this.position.x + arbitraryNumberBetween(-this.radius/4, this.radius/4),
          y: this.position.y + arbitraryNumberBetween(-this.radius/4, this.radius/4)
        },
        velocity: {
          x: arbitraryNumberBetween(-1.5, 1.5),
          y: arbitraryNumberBetween(-1.5, 1.5)
        }
      });
      this.create(ray, 'rays');
    }

    // Dismantle into smaller planetoids
    if(this.radius > 10){
      for (let i = 0; i < 2; i++) {
        let planetoid = new Planetoid({

          size: this.radius/2,
          position: {
            x: arbitraryNumberBetween(-10, 20)+this.position.x,
            y: arbitraryNumberBetween(-10, 20)+this.position.y
          },
          create: this.create.bind(this),
          addScore: this.addScore.bind(this)
        });
        this.create(planetoid, 'planetoids');
      }
    }
  }

  render(state){
    // Move
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // Rotation
    this.rotation += this.rotationSpeed;
    if (this.rotation >= 360) {
      this.rotation -= 360;
    }
    if (this.rotation < 0) {
      this.rotation += 360;
    }

    // Edges of Screen
    if(this.position.x > state.screen.width + this.radius) this.position.x = -this.radius;
    else if(this.position.x < -this.radius) this.position.x = state.screen.width + this.radius;
    if(this.position.y > state.screen.height + this.radius) this.position.y = -this.radius;
    else if(this.position.y < -this.radius) this.position.y = state.screen.height + this.radius;

    // Draw
    const context = state.context;
    context.save();
    context.translate(this.position.x, this.position.y);
    context.rotate(this.rotation * Math.PI / 180);
    context.strokeStyle = '#FFF';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(0, -this.radius);
    for (let i = 1; i < this.vertices.length; i++) {
      context.lineTo(this.vertices[i].x, this.vertices[i].y);
    }
    context.closePath();
    context.stroke();
    context.restore();
  }
}
