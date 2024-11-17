interface PlayerConfigs {
  sprite: Phaser.GameObjects.Sprite;
}

const Player = (configs: PlayerConfigs) => {
  const { sprite } = configs;

  sprite.setOrigin(0.5, 1);
};

export default Player;
