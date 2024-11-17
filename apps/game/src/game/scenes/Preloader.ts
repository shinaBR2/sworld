import { Scene } from 'phaser';

export class Preloader extends Scene {
  constructor() {
    super('Preloader');
  }

  init() {
    this.cameras.main.setBackgroundColor('transparent'); // Make sure new scenes don't cover it
    //  We loaded this image in our Boot Scene, so we can display it here
    const bg = this.add.image(0, 0, 'background');
    bg.setOrigin(0, 0);

    // Calculate scale to cover the screen
    const scaleX = this.cameras.main.width / bg.width;
    const scaleY = this.cameras.main.height / bg.height;
    const scale = Math.max(scaleX, scaleY);

    bg.setScale(scale);

    // bg.setDepth(-1);
    // this.game.scene.scenes[1].sys.displayList.persistent = true; // Make displayList persistent

    //  A simple progress bar. This is the outline of the bar.
    this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

    //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
    const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

    //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    this.load.on('progress', (progress: number) => {
      console.log('progress: ', progress);
      //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
      bar.width = 4 + 460 * progress;
    });
  }

  preload() {
    //  Load the assets for the game - Replace with your own assets
    this.load.setPath('assets');

    this.load.image('logo', 'logo.png');
    this.load.image('star', 'star.png');
    this.load.image('male-character', 'male.png');
    this.load.image('female-character', 'female.png');
  }

  create() {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.
    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
    // setTimeout(() => {
    this.scene.start('VirtualHouse');
    // }, 3000);
  }
}
