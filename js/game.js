import { Spaceship } from './spaceship.js';
import { Enemy } from './Enemy.js';
import { Heal } from './heal.js';
class Game {
  #htmlElements = {
    spaceship: document.querySelector('[data-spaceship]'),
    container: document.querySelector('[data-container]'),
    score: document.querySelector('[data-score]'),
    lives: document.querySelector('[data-lives]'),
    overlayRed: document.querySelector('[data-overlay-red]'),
    overlayGreen: document.querySelector('[data-overlay-green]'),
  };

  #ship = new Spaceship(
    this.#htmlElements.spaceship,
    this.#htmlElements.container
  );

  #lives = null;
  #score = 0;

  #enemies = [];
  #healsObj = [];
  #enemiesInterval = null;
  #checkPositionInterval = null;
  #createEnemyInterval = null;
  #createHealInterval = null;

  init() {
    this.#ship.init();
    this.#newGame();
  }

  #newGame() {
    this.#lives = 3;
    this.#score = 0;
    this.#enemiesInterval = 30;
    this.#createEnemyInterval = setInterval(() => this.#randomNewEnemy(), 5000);
    this.#createHealInterval = setInterval(() => this.#healingObject(), 10000 + this.#getRandomHealTime());
    this.#checkPositionInterval = setInterval(() => this.#checkPosition(), 1);
  }  

  #getRandomHealTime = () =>{
    return Math.floor(Math.random() * (30000 - 50000)) + 50000;
  }

  #healingObject = () =>{
    const heal = new Heal(this.#htmlElements.container, this.#enemiesInterval, 'healing');

    heal.init();
    this.#healsObj.push(heal);
  }

  #randomNewEnemy() {
    const randomNumber = Math.floor(Math.random() * 5) + 1;
    randomNumber % 5
      ? this.#createNewEnemy(this.#htmlElements.container, this.#enemiesInterval, 'enemy', 'explosion')
      : this.#createNewEnemy(this.#htmlElements.container, this.#enemiesInterval * 2, 'enemy--big', 'explosion--big', 3)
  }

  #createNewEnemy(...params) {
    const enemy = new Enemy(...params);

    enemy.init();
    this.#enemies.push(enemy);
  }

  #checkPosition() {
    this.#enemies.forEach((enemy, enemyIndex, enemiesArray) => {

      const enemyPosition = {
        top: enemy.element.offsetTop,
        right: enemy.element.offsetLeft + enemy.element.offsetWidth,
        bottom: enemy.element.offsetTop + enemy.element.offsetHeight,
        left: enemy.element.offsetLeft
      };
      if (enemyPosition.top > window.innerHeight) {
        enemy.explode();
        enemiesArray.splice(enemyIndex, 1);
        this.#livesDown();
      }
      this.#ship.missiles.forEach((missile, missileIndex, missileArray) => {
        const missilePosition = {
          top: missile.element.offsetTop,
          right: missile.element.offsetLeft + missile.element.offsetWidth,
          bottom: missile.element.offsetTop + missile.element.offsetHeight,
          left: missile.element.offsetLeft
        };

        if (missilePosition.bottom >= enemyPosition.top &&
          missilePosition.top <= enemyPosition.bottom &&
          missilePosition.right >= enemyPosition.left &&
          missilePosition.left <= enemyPosition.right) {

          enemy.hit();
          if (!enemy.lives) {
            enemiesArray.splice(enemyIndex, 1);
          }
          missile.remove();
          missileArray.splice(missileIndex, 1);
          this.#updateScore();
        }

        if (missilePosition.bottom < 0) {
          missile.remove();
          missileArray.splice(missileIndex, 1)
        }

      })
    })
  }

  #updateScore(){
    this.#score++;
    if(!(this.#score % 5)){
      this.#enemiesInterval--;
    }
    this.#updateScoreText();
  }

  #livesDown(){
    this.#lives--;
    this.#updateLivesText();
    this.#livesUpdate(this.#htmlElements.overlayRed);
  
  }

  #livesUp(){
    this.#lives++;
    this.#updateLivesText();
    this.#livesUpdate(this.#htmlElements.overlayGreen);
  }

  #livesUpdate = (type) =>{
      type.classList.add('live--change');
      setTimeout(()=> type.classList.remove('live--change'), 300); 
  
  }

  #updateScoreText(){
    this.#htmlElements.score.textContent = `Score: ${this.#score}`
  }

  #updateLivesText(){
    this.#htmlElements.lives.textContent = `Lives: ${this.#lives}`
  }

}

window.onload = function () {
  const game = new Game();
  game.init();
}