import React, { Component } from 'react';
import Vessle from './Vessle';
import Planetoid from './Planetoid';
import { arbitraryNumberBetweenExcluding } from './gameHelpers'

const KEY = {
  LEFT:  37,
  RIGHT: 39,
  UP: 38,
  A: 65,
  D: 68,
  W: 87,
  SPACE: 32
};

export class Game extends Component {
  constructor() {
    super();
    this.state = {
      screen: {
        width: window.innerWidth,
        height: window.innerHeight,
        ratio: window.devicePixelRatio || 1,
      },
      context: null,
      keys : {
        left  : 0,
        right : 0,
        up    : 0,
        down  : 0,
        space : 0,
      },
      planetoidCount: 3,
      currentScore: 0,
      topScore: localStorage['topscore'] || 0,
      inGame: false
    }
    this.vessle = [];
    this.planetoids = [];
    this.shots = [];
    this.rays = [];
  }

  handleResize(value, e){
    this.setState({
      screen : {
        width: window.innerWidth,
        height: window.innerHeight,
        ratio: window.devicePixelRatio || 1,
      }
    });
  }

  handleKeys(value, e){
    let keys = this.state.keys;
    if(e.keyCode === KEY.LEFT   || e.keyCode === KEY.A) keys.left  = value;
    if(e.keyCode === KEY.RIGHT  || e.keyCode === KEY.D) keys.right = value;
    if(e.keyCode === KEY.UP     || e.keyCode === KEY.W) keys.up    = value;
    if(e.keyCode === KEY.SPACE) keys.space = value;
    this.setState({
      keys : keys
    });
  }

  componentDidMount() {
    window.addEventListener('keyup',   this.handleKeys.bind(this, false));
    window.addEventListener('keydown', this.handleKeys.bind(this, true));
    window.addEventListener('resize',  this.handleResize.bind(this, false));

    const context = this.refs.canvas.getContext('2d');
    this.setState({ context: context });
    this.startGame();
    requestAnimationFrame(() => {this.update()});
  }

  componentWillUnmount() {
    window.removeEventListener('keyup', this.handleKeys);
    window.removeEventListener('keydown', this.handleKeys);
    window.removeEventListener('resize', this.handleResize);
  }

  update() {
    const context = this.state.context;
    const keys = this.state.keys;
    const vessle = this.vessle[0];

    context.save();
    context.scale(this.state.screen.ratio, this.state.screen.ratio);

    //Tracers
    context.fillStyle = '#000';
    context.globalAlpha = 0.4;
    context.fillRect(0, 0, this.state.screen.width, this.state.screen.height);
    context.globalAlpha = 1;

    //Prepare Next set
    if(!this.planetoids.length){
      let count = this.state.planetoidCount + 1;
      this.setState({ planetoidCount: count });
      this.spawnPlanetoids(count)
    }

    //Check for colisions
    this.checkWrecksWith(this.shots, this.planetoids);
    this.checkWrecksWith(this.vessle, this.planetoids);

    //Remove or render
    this.updateObjects(this.rays, 'rays')
    this.updateObjects(this.planetoids, 'planetoids')
    this.updateObjects(this.shots, 'shots')
    this.updateObjects(this.vessle, 'vessle')

    context.restore();

    //Update frame
    requestAnimationFrame(() => {this.update()});
  }

  addScore(points){
    if(this.state.inGame){
      this.setState({
        currentScore: this.state.currentScore + points,
      });
    }
  }

  startGame(){
    this.setState({
      inGame: true,
      currentScore: 0,
    });

    //Create vessle
    let vessle = new vessle({
      position: {
        x: this.state.screen.width/2,
        y: this.state.screen.height/2
      },
      create: this.createObject.bind(this),
      onCroak: this.gameOverMan.bind(this)
    });
    this.createObject(vessle, 'vessle');

    //Create planetoids
    this.planetoids = [];
    this.spawnPlanetoids(this.state.planetoidCount)
  }

  gameOverMan(){
    this.setState({
      inGame: false,
    });

    // Replace top score
    if(this.state.currentScore > this.state.topScore){
      this.setState({
        topScore: this.state.currentScore,
      });
      localStorage['topscore'] = this.state.currentScore;
    }
  }

  spawnPlanetoids(howMany){
    let planetoids = [];
    let vessle = this.vessle[0];
    for (let i = 0; i < howMany; i++) {
      let planetoid = new Planetoid({
        size: 80,
        position: {
          x: arbitraryNumberBetweenExcluding(0, this.state.screen.width, vessle.position.x-60, vessle.position.x+60),
          y: arbitraryNumberBetweenExcluding(0, this.state.screen.height, vessle.position.y-60, vessle.position.y+60)
        },
        create: this.createObject.bind(this),
        addScore: this.addScore.bind(this)
      });
      this.createObject(planetoid, 'planetoids');
    }
  }

  createObject(item, group){
    this[group].push(item);
  }

  updateObjects(items, group){
    let index = 0;
    for (let item of items) {
      if (item.delete) {
        this[group].splice(index, 1);
      }else{
        items[index].render(this.state);
      }
      index++;
    }
  }

  checkWrecksWith(items1, items2) {
    var a = items1.length - 1;
    var b;
    for(a; a > -1; --a){
      b = items2.length - 1;
      for(b; b > -1; --b){
        var item1 = items1[a];
        var item2 = items2[b];
        if(this.checkWreck(item1, item2)){
          item1.annihilate();
          item2.annihilate();
        }
      }
    }
  }

  checkWreck(obj1, obj2){
    var vx = obj1.position.x - obj2.position.x;
    var vy = obj1.position.y - obj2.position.y;
    var length = Math.sqrt(vx * vx + vy * vy);
    if(length < obj1.radius + obj2.radius){
      return true;
    }
    return false;
  }

  render() {
    let endgame;
    let message;

    if (this.state.currentScore <= 0) {
      message = '0 points... better luck next time.';
    } else if (this.state.currentScore >= this.state.topScore){
      message = 'High score with ' + this.state.currentScore + ' points. Woo!';
    } else {
      message = this.state.currentScore + ' Points though :)'
    }

    if(!this.state.inGame){
      endgame = (
        <div className="endgame">
          <p>Game over, man!I don't know if you keep up on current evets, but you just got your butt kicked back there.</p>
          <p>{message}</p>
          <button
            onClick={ this.startGame.bind(this) }>
            play again?
          </button>
        </div>
      )
    }

    return (
      <div>
        { endgame }
        <span className="score current-score" >Score: {this.state.currentScore}</span>
        <span className="score top-score" >High Score: {this.state.topScore}</span>
        <span className="controls" >
          Press [A][S][W][D] or [←][↑][↓][→] to Move<br/>
          Press [SPACE BAR] to Fire
        </span>
        <canvas ref="canvas"
          width={this.state.screen.width * this.state.screen.ratio}
          height={this.state.screen.height * this.state.screen.ratio}
        />
      </div>
    );
  }
}
