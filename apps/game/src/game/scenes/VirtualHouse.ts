import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class VirtualHouse extends Scene {
  private avatar: string;
  private player: Phaser.Physics.Arcade.Sprite;
  private headphone: Phaser.Physics.Arcade.Sprite;
  private desk: Phaser.Physics.Arcade.Image;
  private laptop: Phaser.Physics.Arcade.Image;
  private walls: Phaser.GameObjects.Graphics;
  private infoText: Phaser.GameObjects.Text;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private rKey: Phaser.Input.Keyboard.Key;
  private isNearHeadphone: boolean = false;
  private currentAudioIndex: number = 0;
  private audio: HTMLAudioElement | null = null;
  private audioList: string[] = [];
  private isUsingHeadphone: boolean = false;

  constructor() {
    super({
      key: 'VirtualHouse',
      physics: {
        arcade: {
          gravity: { y: 0 },
          debug: false,
        },
      },
    });
  }

  preload(): void {
    // Load assets
    this.load.image('player', 'assets/player.svg');
    this.load.image('desk', 'assets/desk.svg');
    this.load.image('laptop', 'assets/laptop.svg');
    this.load.image('headphone', 'assets/headphone.svg');
  }

  create(): void {
    EventBus.on('signed_in', (isSignedIn: boolean) => {
      console.log('is sigend in?', isSignedIn);
    });
    EventBus.on('avatar_selected', (avatar: string) => {
      console.log('selected avater', avatar);
      this.avatar = avatar;

      this.createPlayer();
      this.createStaticObjects();
    });

    // const bg = this.add.image(0, 0, "background");
    // bg.setOrigin(0, 0);

    // // Calculate scale to cover the screen
    // const scaleX = this.cameras.main.width / bg.width;
    // const scaleY = this.cameras.main.height / bg.height;
    // const scale = Math.max(scaleX, scaleY);

    // bg.setScale(scale);

    // // Function to resize background
    // const resizeBg = () => {
    //   bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
    // };

    // // Initial resize
    // resizeBg();

    // // Handle window resize
    // this.scale.on("resize", resizeBg);

    this.infoText = this.add.text(400, 50, 'Move to the headphone!', {
      fontSize: '32px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 },
    });

    this.cursors = this.input.keyboard.createCursorKeys();

    // Simple R key handler
    this.input.keyboard.addKey('R').on('down', () => {
      // If colliding and not already using headphone, sit down
      console.log(
        'collide?',
        this.physics.world.overlap(this.player, this.headphone)
      );
      if (
        // this.physics.world.overlap(this.player, this.headphone) &&
        !this.isUsingHeadphone
      ) {
        this.startUsingHeadphone();
      }
    });

    this.input.keyboard.addKey('SPACE').on('down', () => {
      if (this.isUsingHeadphone) {
        this.stopUsingHeadphone();
      }
    });

    EventBus.emit('current-scene-ready', this);
  }

  private createStaticObjects(): void {
    // Create static walls
    const wallsGroup = this.physics.add.staticGroup();
    wallsGroup.add(this.add.rectangle(100, 350, 4, 500, 0x000000));
    wallsGroup.add(this.add.rectangle(900, 350, 4, 500, 0x000000));
    wallsGroup.add(this.add.rectangle(500, 100, 800, 4, 0x000000));
    wallsGroup.add(this.add.rectangle(500, 600, 800, 4, 0x000000));

    // Create desk
    this.desk = this.physics.add.sprite(450, 400, 'desk');
    this.desk.setScale(0.5);
    this.desk.setImmovable(true);

    // Create laptop
    this.laptop = this.physics.add.sprite(450, 380, 'laptop');
    this.laptop.setScale(0.3);
    this.laptop.setImmovable(true);

    // Create headphone
    this.headphone = this.physics.add.staticGroup();
    const headphoneSprite = this.headphone.create(500, 380, 'headphone');
    headphoneSprite.setScale(0.3);

    // Match collision box to sprite size
    headphoneSprite.body.setSize(headphoneSprite.width, headphoneSprite.height);
    headphoneSprite.body.setOffset(0, 0);
    headphoneSprite.refreshBody();

    this.headphonePosition = { x: headphoneSprite.x, y: headphoneSprite.y };
  }

  private createPlayer(): void {
    console.log('createPlayer called');
    if (this.avatar == 'male') {
      this.player = this.physics.add.sprite(150, 350, 'male-character');
    } else {
      this.player = this.physics.add.sprite(150, 350, 'female-character');
    }

    this.player.setScale(1.3);
    this.player.setCollideWorldBounds(true);

    // Match collision box to sprite
    this.player.body.setSize(this.player.width, this.player.height);
    this.player.body.setOffset(0, 0);

    // Add all colliders
    this.physics.add.collider(this.player, this.desk);
    this.physics.add.collider(this.player, this.laptop);
    // this.physics.add.collider(this.player, this.headphone);
    this.physics.add.collider(this.player, this.headphone, () => {
      // Only set nearHeadphone if we're actually touching
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.headphonePosition.x,
        this.headphonePosition.y
      );

      console.log('distance: ', distance);

      // Only allow interaction when very close (adjust this number as needed)
      if (distance < 50) {
        // This should require actual contact
        this.isNearHeadphone = true;
        this.infoText.setText('Press R to use headphone');
      }
    });
  }

  private startUsingHeadphone(): void {
    console.log('startUsingHeadphone called');
    // Store current position
    this.originalPosition = { x: this.player.x, y: this.player.y };

    // Move to headphone
    this.player.setPosition(this.headphonePosition.x, this.headphonePosition.y);

    // Update states
    this.isUsingHeadphone = true;

    // Update text
    this.infoText.setText('Using headphone (Press SPACE to stand up)');
  }

  private stopUsingHeadphone(): void {
    // Return to original position
    this.player.setPosition(this.originalPosition.x, this.originalPosition.y);

    // Update states
    this.isUsingHeadphone = false;
    this.isNearHeadphone = false;

    // Update text
    this.infoText.setText('Move to the headphone!');
  }

  update(): void {
    if (!this.avatar) {
      return;
    }

    if (!this.isUsingHeadphone) {
      // Handle movement
      const speed = 160;
      let velocityX = 0;
      let velocityY = 0;

      if (this.cursors.left.isDown) velocityX = -speed;
      if (this.cursors.right.isDown) velocityX = speed;
      if (this.cursors.up.isDown) velocityY = -speed;
      if (this.cursors.down.isDown) velocityY = speed;

      if (velocityX !== 0 && velocityY !== 0) {
        const normalize = Math.sqrt(2) / 2;
        velocityX *= normalize;
        velocityY *= normalize;
      }

      this.player.setVelocity(velocityX, velocityY);

      // Update info text based on collision
      if (this.physics.world.overlap(this.player, this.headphone)) {
        this.infoText.setText('Press R to use headphone');
      } else {
        this.infoText.setText('Move to the headphone!');
      }
    } else {
      this.player.setVelocity(0, 0);
    }

    if (!this.isUsingHeadphone && !this.isNearHeadphone) {
      this.infoText.setText('Move to the headphone!');
    }
    this.isNearHeadphone = false;
  }
}
