import { GameScene } from '../scenes/game';
import Bubble from './bubble';

export default class Bat extends Phaser.Physics.Matter.Sprite {
  scene: GameScene;
  label: string;
  startX: any;
  direction: number;
  unsubscribeBatCollide: any;
  dead: boolean = false;

  constructor(scene: GameScene, x: number, y: number, texture = 'bat') {
    super(scene.matter.world, x, y, texture, 0);
    this.label = 'bat';
    this.scene = scene;
    this.scene.add.existing(this);
    this.startX = x;
    this.direction = Phaser.Math.RND.pick([-1, 1]);
    this.setFixedRotation();
    this.setIgnoreGravity(true);
    this.addCollisions();
    this.init();
  }

  /*
    Initiate the bat animation and movement. Also, add the update event to the scene so it will update in this class.
  */
  init() {
    this.anims.play(this.label, true);
    this.on('animationcomplete', this.animationComplete, this);
    this.setVelocityX(this.direction * 5);
    this.scene.events.on('update', this.update, this);
  }

  /*
    We add the collision event to the scene so we can handle the collision with the bat and the bubble.
  */
  addCollisions() {
    // @ts-ignore
    this.unsubscribeBatCollide = this.scene.matterCollision.addOnCollideStart({
      objectA: this,
      callback: this.onBatCollide,
      context: this,
    });
  }

  onBatCollide({ gameObjectB }: CollisionData) {
    if (gameObjectB instanceof Bubble) {
      gameObjectB.load('bat');
      this.destroy();
    }
  }

  /*
    Update the bat movement. If the bat is not moving anymore, we turn it around.
  */
  update() {
    if (!this.active) return;
    if (Math.abs(this.body?.velocity?.x ?? 0) <= 0.5) this.turn();
  }

  /*
    This function turns the bat around and sets the velocity to the new direction.
  */
  turn() {
    this.direction = -this.direction;
    this.flipX = this.direction > 0;
    this.setFlipX(this.direction > 0);
    this.setVelocityX(this.direction * 5);
  }

  /*
    We don't destroy the bat directly, we kill the bat and play the death animation.
  */
  death() {
    this.dead = true;
    this.anims.play(this.label + 'death');
  }

  /*
    This destroys the bat after the death animation is complete.
  */
  animationComplete(animation: { key: string }) {
    if (animation.key === this.label + 'death') {
      this.destroy();
    }
  }
}
