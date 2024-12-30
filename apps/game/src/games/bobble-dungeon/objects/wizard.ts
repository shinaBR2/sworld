import Bubble from './bubble';
import { GameScene } from '../scenes/game';

export default class Wizard extends Phaser.Physics.Matter.Sprite {
  scene: GameScene;
  label: string;
  startX: number;
  direction: number;
  timer: Phaser.Time.TimerEvent | undefined;
  unsubscribeBatCollide: any;
  delayedTurn: Phaser.Time.TimerEvent | undefined;
  fireball: any;

  constructor(scene: GameScene, x: number, y: number, texture = 'wizard') {
    super(scene.matter.world, x, y, texture, 0);
    this.scene = scene;
    this.label = 'wizard';
    this.scene.add.existing(this);
    this.startX = x;
    this.direction = Phaser.Math.RND.pick([-1, 1]);

    this.setFixedRotation();
    this.addCollisions();
    this.init();
  }

  /*
This function inits the wizard. It creates the animations and the update event. Also, we create a timer that will be used to shoot the fireballs.
  */
  init() {
    this.anims.play(this.label, true);
    this.scene.events.on('update', this.update, this);
    this.timer = this.scene.time.addEvent({
      delay: 3000,
      callback: this.directShot,
      callbackScope: this,
      loop: true,
    });
  }

  /*
As we did with the player and the bat, we create this callback to handle the collision with the bubble.
  */
  addCollisions() {
    // @ts-ignore
    this.unsubscribeBatCollide = this.scene.matterCollision.addOnCollideStart({
      objectA: this,
      callback: this.onWizardCollide,
      context: this,
    });
  }

  /*
This will be called when the bubble hits the wizard. We "load" the wizard inside the bubble and destroy the wizard.
  */
  onWizardCollide({ gameObjectB }: CollisionData) {
    if (gameObjectB instanceof Bubble) {
      gameObjectB.load('wizard');
      this.destroy();
    }
  }

  /*
The wizard will try to shoot directly at the player. It will shoot a fireball and then turn around.
  */
  directShot() {
    this.scene.playAudio('fireball');
    this.anims.play('wizardshot', true);
    this.delayedTurn = this.scene.time.delayedCall(
      1000,
      () => {
        this.turn();
      },
      undefined,
      this
    );
  }

  /*
  This method takes care of turning the wizard around.
  */
  turn() {
    this.direction = -this.direction;
    this.flipX = this.direction > 0;
    this.setFlipX(this.direction > 0);
    this.setVelocityX(this.direction * 5);
  }

  /*
This will be called when the wizard is destroyed. We destroy the timer and the delayed turn before destroying the wizard.
  */
  destroy() {
    if (this.timer) this.timer.destroy();
    if (this.delayedTurn) this.delayedTurn.destroy();
    if (this.fireball) this.fireball.destroy();
    super.destroy();
  }
}
