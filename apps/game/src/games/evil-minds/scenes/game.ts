import { Tilemaps } from 'phaser';
import { handlePlayerMovement } from '../../../core/helpers/movement';
import { checkTileInteraction } from '../../../core/helpers/tileInteraction';
import { EventBus } from '../../../core/EventBus';
import {
  PLAYER_DONE_READ_HOUSE_SIGN,
  PLAYER_READ_HOUSE_SIGN,
} from '../events/playerEvents';

const SCALE = 1.5;
const TILE_SIZE = SCALE * 16;

interface GameStates {
  isDialogueOpen: boolean;
  isPaused: boolean;
  isInventoryOpen: boolean;
}

const INITIAL_STATES: GameStates = {
  isDialogueOpen: false,
  isPaused: false,
  isInventoryOpen: false,
};

class GameScene extends Phaser.Scene {
  gridEngine: any;
  borders!: Phaser.Physics.Arcade.StaticGroup;
  map!: Phaser.Tilemaps.Tilemap;
  walls!: Phaser.Physics.Arcade.StaticGroup;
  blocks!: Phaser.Physics.Arcade.StaticGroup;
  player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  groundLayer!: Phaser.Tilemaps.TilemapLayer;
  onFloorLayer!: Phaser.Tilemaps.TilemapLayer;
  decorationLayer!: Phaser.Tilemaps.TilemapLayer;
  interactKey!: Phaser.Input.Keyboard.Key;
  states: GameStates = { ...INITIAL_STATES };

  constructor() {
    super({ key: 'GameScene' });
  }

  init = () => {};

  create = () => {
    const map = this.createMap();
    this.createPlayer();
    this.initGridEngine(map);
    this.setupCamera();
    this.setupKeyboard();
    this.setupEvents();
  };

  update = () => {
    if (this.canPlayerMove()) {
      handlePlayerMovement({
        cursors: this.cursors,
        gridEngine: this.gridEngine,
      });

      checkTileInteraction({
        gridEngine: this.gridEngine,
        layer: this.decorationLayer,
        propertyKey: 'isHouseSign',
        interactKey: this.interactKey,
        onInteract: this.onInteractWithHouseSign,
      });
    }
  };

  /**
   * END OF LIFE CYCLES
   */
  canPlayerMove = () => {
    return !this.states.isDialogueOpen;
  };

  createMap = () => {
    // Create the tilemap
    const map = this.make.tilemap({ key: 'map' });

    this.createMapLayers(map);

    return map;
  };

  createPlayer = () => {
    const offsetX = TILE_SIZE / 2;
    const offsetY = TILE_SIZE;
    this.player = this.physics.add.sprite(
      5 * TILE_SIZE + offsetX,
      14 * TILE_SIZE + offsetY,
      'player',
      55 // frame for the first load
    );
    this.player.setDepth(2);
    this.player.setScale(SCALE);
  };

  initGridEngine = (map: Phaser.Tilemaps.Tilemap) => {
    /**
     * See the player.png file
     * Grid engine split the spritesheets into multiple blocks like
     * [Block 0][Block 1][Block 2][Block 3]
     * [Block 4][Block 5][Block 6][Block 7]
     *
     * Each block contains 4 rows, each row has 3 frames
     */
    const gridEngineConfig = {
      characters: [
        {
          id: 'player',
          sprite: this.player,
          walkingAnimationMapping: 4, // the zero-based index of block
          startPosition: { x: 5, y: 14 },
        },
      ],
      numberOfDirections: 8,
    };
    this.gridEngine.create(map, gridEngineConfig);
  };

  setupCamera = () => {
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(
      0,
      0,
      this.game.config.width as number,
      this.game.config.height as number
    );
  };

  setupKeyboard = () => {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.interactKey = this.input.keyboard!.addKey('R');
  };

  setupEvents = () => {
    EventBus.on(PLAYER_DONE_READ_HOUSE_SIGN, () => {
      this.states.isDialogueOpen = false;
    });
  };

  /**
   * HELPERS
   */

  createMapLayers = (map: Phaser.Tilemaps.Tilemap) => {
    /**
     * addTilesetImage(tileset_name, imageKey)
     * - tileset_name: name of Tileset in Tile Map Editor
     * - imageKey: Phaser image key, first params of this.load.image()
     */
    const tileset = map.addTilesetImage(
      'cloud_map',
      'map'
    ) as Phaser.Tilemaps.Tileset;

    // Create layers (use the layer names from your Tiled map)
    this.groundLayer = map.createLayer('floor', tileset);
    this.onFloorLayer = map.createLayer('onfloor', tileset);
    this.decorationLayer = map.createLayer('decoration', tileset);
    const overlayLayer = map.createLayer('overlay', tileset);
    // this.interactLayer = map.createLayer('interact', tileset, 0, 0);

    this.groundLayer?.setDepth(0);
    this.groundLayer?.setScale(SCALE);

    this.onFloorLayer?.setDepth(1);
    this.onFloorLayer?.setScale(SCALE);

    this.decorationLayer?.setDepth(2);
    this.decorationLayer?.setScale(SCALE);

    overlayLayer?.setVisible(false);

    const layers = [this.groundLayer, this.onFloorLayer, this.decorationLayer];

    return layers;
  };

  /**
   * HANDLERS
   */
  onInteractWithHouseSign = (_tile: Tilemaps.Tile) => {
    EventBus.emit(PLAYER_READ_HOUSE_SIGN);

    this.states.isDialogueOpen = true;
  };
}

export default GameScene;
