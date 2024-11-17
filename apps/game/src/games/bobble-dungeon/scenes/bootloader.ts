import { EventBus, SCENE_READY } from '../../../core/EventBus';

export default class Bootloader extends Phaser.Scene {
  private loadBar!: Phaser.GameObjects.Graphics;
  private progressBar!: Phaser.GameObjects.Graphics;
  private assetPath = 'assets/bobble-dungeon';

  constructor() {
    super({ key: 'bootloader' });
  }

  preload(): void {
    this.createBars();
    this.setLoadEvents();
    this.loadFonts();
    this.loadImages();
    this.loadMaps();
    this.loadAudios();
    this.loadSpritesheets();
  }

  private setLoadEvents(): void {
    this.load.on(
      'progress',
      function (this: Bootloader, value: number) {
        this.progressBar.clear();
        this.progressBar.fillStyle(0x0088aa, 1);
        this.progressBar.fillRect(
          this.cameras.main.width / 4,
          this.cameras.main.height / 2 - 16,
          (this.cameras.main.width / 2) * value,
          16
        );
      },
      this
    );

    this.load.on(
      'complete',
      () => {
        this.createAnimations();

        EventBus.emit(SCENE_READY, this);
        this.scene.start('splash');
      },
      this
    );

    this.load.on('loaderror', (file: { src: any }) => {
      console.log('Error loading:', file.src);
    });
  }

  private loadFonts(): void {
    const fontPath = `${this.assetPath}/fonts`;

    this.load.bitmapFont(
      'default',
      `${fontPath}/pico.png`,
      `${fontPath}/pico.xml`
    );
  }

  private loadImages(): void {
    const imagePath = `${this.assetPath}/images`;

    this.load.image('pello', `${imagePath}/pello_ok.png`);
    this.load.image('fireball', `${imagePath}/fireball.png`);
    this.load.image('tiles', `${this.assetPath}/maps/pixel-poem-tiles.png`);
    this.load.image('block', `${imagePath}/block.png`);
    this.load.image('seesaw', `${imagePath}/seesaw.png`);
    this.load.image('bubble', `${imagePath}/bubble.png`);
    this.load.image('platform', `${imagePath}/platform.png`);
  }

  private loadMaps(): void {
    this.load.tilemapTiledJSON('scene0', `${this.assetPath}/maps/level.json`);
  }

  private loadAudios(): void {
    const soundPath = `${this.assetPath}/sounds`;
    Array(5)
      .fill(0)
      .forEach((_, i) => {
        this.load.audio(`climb${i}`, `${soundPath}/climb${i}.mp3`);
      });

    this.load.audio('splash', `${soundPath}/splash.mp3`);
    this.load.audio('music', `${soundPath}/music.mp3`);
    this.load.audio('jump', `${soundPath}/jump.mp3`);
    this.load.audio('bubble', `${soundPath}/bubble.mp3`);
    this.load.audio('trap', `${soundPath}/trap.mp3`);
    this.load.audio('crash', `${soundPath}/crash.mp3`);
    this.load.audio('fireball', `${soundPath}/fireball.mp3`);
    this.load.audio('win', `${soundPath}/win.mp3`);
    this.load.audio('start', `${soundPath}/start.mp3`);
    this.load.audio('death', `${soundPath}/death.mp3`);
  }

  private loadSpritesheets(): void {
    const imagesPath = `${this.assetPath}/images`;

    this.load.spritesheet('player', `${imagesPath}/player.png`, {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.spritesheet('dust', `${imagesPath}/dust.png`, {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet('coin', `${imagesPath}/coin.png`, {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet('keys', `${imagesPath}/keys.png`, {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.spritesheet('bat', `${imagesPath}/bat.png`, {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet('wizard', `${imagesPath}/wizard.png`, {
      frameWidth: 48,
      frameHeight: 48,
    });
  }

  private createBars(): void {
    this.loadBar = this.add.graphics();
    this.loadBar.fillStyle(0x00aafb, 1);
    this.loadBar.fillRect(
      this.cameras.main.width / 4 - 2,
      this.cameras.main.height / 2 - 18,
      this.cameras.main.width / 2 + 4,
      20
    );
    this.progressBar = this.add.graphics();
  }

  private createAnimations(): void {
    this.anims.create({
      key: 'coin',
      frames: this.anims.generateFrameNumbers('coin', {
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'bat',
      frames: this.anims.generateFrameNumbers('bat', {
        start: 0,
        end: 1,
      }),
      frameRate: 5,
      repeat: -1,
    });

    this.anims.create({
      key: 'batdeath',
      frames: this.anims.generateFrameNumbers('bat', {
        start: 2,
        end: 5,
      }),
      frameRate: 5,
    });

    this.anims.create({
      key: 'wizard',
      frames: this.anims.generateFrameNumbers('wizard', {
        start: 0,
        end: 5,
      }),
      frameRate: 5,
      repeat: -1,
    });

    this.anims.create({
      key: 'wizardshot',
      frames: this.anims.generateFrameNumbers('wizard', {
        start: 4,
        end: 5,
      }),
      frameRate: 5,
      repeat: -1,
    });

    this.anims.create({
      key: 'playeridle',
      frames: this.anims.generateFrameNumbers('player', {
        start: 0,
        end: 1,
      }),
      frameRate: 5,
      repeat: -1,
    });

    this.anims.create({
      key: 'playerwalk',
      frames: this.anims.generateFrameNumbers('player', {
        start: 0,
        end: 3,
      }),
      frameRate: 6,
    });

    this.anims.create({
      key: 'playershot',
      frames: this.anims.generateFrameNumbers('player', {
        start: 4,
        end: 5,
      }),
      frameRate: 4,
    });

    this.anims.create({
      key: 'dust',
      frames: this.anims.generateFrameNumbers('dust', {
        start: 0,
        end: 10,
      }),
      frameRate: 10,
    });
  }
}
