class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    this.createLoadingScreen();
    this.loadAssets();
  }

  createLoadingScreen() {
    // Create loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 4, height / 2 - 30, width / 2, 50);

    // Loading text
    const loadingText = this.add.text(
      width / 2,
      height / 2 - 50,
      'Loading...',
      {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ffffff',
      }
    );
    loadingText.setOrigin(0.5);

    // Percentage text
    const percentText = this.add.text(width / 2, height / 2 + 70, '0%', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
    });
    percentText.setOrigin(0.5);

    // Loading file text
    const assetText = this.add.text(width / 2, height / 2 + 100, '', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
    });
    assetText.setOrigin(0.5);

    // Register loading events
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(
        width / 4 + 10,
        height / 2 - 20,
        (width / 2 - 20) * value,
        30
      );
      percentText.setText(`${Math.floor(value * 100)}%`);
    });

    this.load.on('fileprogress', (file: { key: string }) => {
      assetText.setText('Loading asset: ' + file.key);
    });

    this.load.on('complete', () => {
      this.createAnimations();
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
      assetText.destroy();

      this.startGame();
    });
  }

  loadAssets() {
    const basePath = 'assets/evil-minds';
    this.load.tilemapTiledJSON('map', `${basePath}/map.json`);
    // Load ALL tileset images used in the map
    this.load.image('map', `${basePath}/map/tileset.png`);

    // Character sprites
    this.load.spritesheet('player', `${basePath}/player.png`, {
      frameWidth: 26,
      frameHeight: 36,
    });

    // // Audio
    // this.load.audio('bgm-main', 'assets/audio/background-music.mp3');
    // this.load.audio('sfx-footsteps', 'assets/audio/footsteps.mp3');
    // this.load.audio('sfx-dialog', 'assets/audio/dialog-blip.mp3');

    // // Fonts
    // this.load.bitmapFont(
    //   'pixel-font',
    //   'assets/fonts/pixel.png',
    //   'assets/fonts/pixel.xml'
    // );

    // // Effects
    // this.load.spritesheet('particles', 'assets/effects/particles.png', {
    //   frameWidth: 16,
    //   frameHeight: 16,
    // });
  }

  startGame() {
    // Optional: Add a slight delay before starting the game
    this.time.delayedCall(500, () => {
      // You can add a fade out effect here
      this.cameras.main.fadeOut(1000);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        // Start with the menu scene first
        this.scene.start('GameScene');
      });
    });
  }

  createPlayerAnimations() {
    /**
     * Generally:
     * Lower frameRate (4-6) = slower, more leisurely animations
     * Medium frameRate (8-12) = typical walking animations
     * Higher frameRate (15+) = faster animations, good for running
     */
    const frameRate = 8;
    const repeat = -1; // -1 means loop forever

    // Front-facing animations
    this.anims.create({
      key: 'idle-down',
      frames: [{ key: 'player', frame: 55 }], // Middle frame of first row
      frameRate,
    });

    this.anims.create({
      key: 'walk-down',
      frames: this.anims.generateFrameNumbers('player', {
        start: 54,
        end: 56,
        first: 54,
      }),
      frameRate: frameRate,
      repeat,
    });

    // Left-facing animations (second row, frames 3-5)
    this.anims.create({
      key: 'idle-left',
      frames: [{ key: 'player', frame: 67 }], // Middle frame of second row
      frameRate: frameRate,
    });

    this.anims.create({
      key: 'walk-left',
      frames: this.anims.generateFrameNumbers('player', {
        start: 66,
        end: 68,
      }),
      frameRate: frameRate,
      repeat: repeat,
    });

    // Right-facing animations (third row, frames 6-8)
    this.anims.create({
      key: 'idle-right',
      frames: [{ key: 'player', frame: 79 }], // Middle frame of third row
      frameRate: frameRate,
    });

    this.anims.create({
      key: 'walk-right',
      frames: this.anims.generateFrameNumbers('player', {
        start: 78,
        end: 80,
      }),
      frameRate: frameRate,
      repeat: repeat,
    });

    // Back-facing animations (fourth row, frames 9-11)
    this.anims.create({
      key: 'idle-up',
      frames: [{ key: 'player', frame: 91 }], // Middle frame of fourth row
      frameRate: frameRate,
    });

    this.anims.create({
      key: 'walk-up',
      frames: this.anims.generateFrameNumbers('player', {
        start: 90,
        end: 91,
      }),
      frameRate: frameRate,
      repeat: repeat,
    });
  }

  createAnimations() {
    this.createPlayerAnimations();
  }
}

export default BootScene;
