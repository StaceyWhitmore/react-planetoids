import Shot from './Shot';
import Ray from './Ray';
import { rotatePoint, arbitraryNumberBetween } from './gameHelpers';

export default class Vessle {
  constructor(args) {
    this.position = args.position
    this.velocity = {
      x: 0,
      y: 0
    }
    this.rotation = 0;
    this.rotationSpeed = 6;
    this.speed = 0.15;
    this.inertia = 0.99;
    this.radius = 20;
    this.lastShot = 0;
    this.create = args.create;
    this.onCroak = args.onCroak;
  }

  annihilate(){
    this.delete = true;
    this.onCroak();

    // Explode
    for (let i = 0; i < 60; i++) {
      const ray = new Ray({
        lifeSpan: arbitraryNumberBetween(60, 100),
        size: arbitraryNumberBetween(1, 4),
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
  }

  rotate(dir){
    if (dir == 'LEFT') {
      this.rotation -= this.rotationSpeed;
    }
    if (dir == 'RIGHT') {
      this.rotation += this.rotationSpeed;
    }
  }

  accelerate(val){
    this.velocity.x -= Math.sin(-this.rotation*Math.PI/180) * this.speed;
    this.velocity.y -= Math.cos(-this.rotation*Math.PI/180) * this.speed;

    // Thrust ray
    let posDelta = rotatePoint({x:0, y:-10}, {x:0,y:0}, (this.rotation-180) * Math.PI / 180);
    const ray = new Ray({
      lifeSpan: arbitraryNumberBetween(20, 40),
      size: arbitraryNumberBetween(1, 3),
      position: {
        x: this.position.x + posDelta.x + arbitraryNumberBetween(-2, 2),
        y: this.position.y + posDelta.y + arbitraryNumberBetween(-2, 2)
      },
      velocity: {
        x: posDelta.x / arbitraryNumberBetween(3, 5),
        y: posDelta.y / arbitraryNumberBetween(3, 5)
      }
    });
    this.create(ray, 'rays');
  }

  render(state){
    // Controls
    if(state.keys.up){
      this.accelerate(1);
    }
    if(state.keys.left){
      this.rotate('LEFT');
    }
    if(state.keys.right){
      this.rotate('RIGHT');
    }
    if(state.keys.space && Date.now() - this.lastShot > 300){
      const shot = new Shot({vessle: this});
      this.create(shot, '`shot`s');
      this.lastShot = Date.now();
    }

    // Move
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.velocity.x *= this.inertia;
    this.velocity.y *= this.inertia;

    // Rotate
    if (this.rotation >= 360) {
      this.rotation -= 360;
    }
    if (this.rotation < 0) {
      this.rotation += 360;
    }

    // Screen edges
    if(this.position.x > state.screen.width) this.position.x = 0;
    else if(this.position.x < 0) this.position.x = state.screen.width;
    if(this.position.y > state.screen.height) this.position.y = 0;
    else if(this.position.y < 0) this.position.y = state.screen.height;

    // Draw
    const context = state.context;
    context.save();
    context.translate(this.position.x, this.position.y);
    context.rotate(this.rotation * Math.PI / 180);
    context.strokeStyle = '#ffffff';
    context.fillStyle = '#000000';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(0, -15);
    context.lineTo(10, 10);
    context.lineTo(5, 7);
    context.lineTo(-5, 7);
    context.lineTo(-10, 10);
    context.closePath();
    context.fill();
    context.stroke();
    context.restore();
  }
}
