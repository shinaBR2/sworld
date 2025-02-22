import { GameScene } from '../scenes/game';

export default class Coin extends Phaser.Physics.Matter.Sprite {
  scene: GameScene;
  label: string;
  tween: Phaser.Tweens.Tween | undefined;

  constructor(scene: GameScene, x: number, y: number, texture = 'coin', options = { isStatic: true }) {
    super(scene.matter.world, x, y, texture, 0, options);
    this.scene = scene;
    this.label = 'coin';
    scene.add.existing(this);
    this.init();
  }

  /*
    The coin animation is created and played. Also, we add a tween to make it move up and down to make it more "desirable".
  */
  init() {
    this.anims.play(this.label, true);
    this.tween = this.scene.tweens.add({
      targets: this,
      duration: 300,
      y: '-=5',
      repeat: -1,
      yoyo: true,
    });
  }

  /*
    When the coin is collected, we stop the tween and destroy the coin.
  */
  destroy() {
    this.tween?.stop();
    super.destroy();
  }
}
