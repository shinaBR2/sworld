import { GameScene } from '../scenes/game';

export default class Dust extends Phaser.GameObjects.Sprite {
  scene: GameScene;

  constructor(scene: GameScene, x: number, y: number, name = 'dust', tween = false) {
    super(scene, x, y, name);
    this.scene = scene;
    this.name = name;
    this.setScale(0.5);
    this.scene.add.existing(this);
    this.init(tween);
  }

  /*
    This dust is a simple sprite that plays an animation and then destroys itself. It's used when the player lands, slides on a wall, or jumps. We can optionally add a tween to make it fade out.
  */
  init(tween: boolean) {
    if (tween) {
      this.scene.tweens.add({
        targets: this,
        duration: Phaser.Math.Between(500, 1000),
        alpha: { from: 1, to: 0 },
        onComplete: () => {
          this.destroy();
        },
      });
    }

    this.on('animationcomplete', this.animationComplete, this);
    this.anims.play(this.name, true);
  }

  animationComplete() {
    this.destroy();
  }
}
