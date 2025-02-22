import GridEngine, { Direction } from 'grid-engine';

interface HandlePlayerMovementParams {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  gridEngine: GridEngine;
}

const handlePlayerMovement = ({ cursors, gridEngine }: HandlePlayerMovementParams) => {
  if (cursors.left.isDown && cursors.up.isDown) {
    gridEngine.move('player', Direction.UP_LEFT);
  } else if (cursors.left.isDown && cursors.down.isDown) {
    gridEngine.move('player', Direction.DOWN_LEFT);
  } else if (cursors.right.isDown && cursors.up.isDown) {
    gridEngine.move('player', Direction.UP_RIGHT);
  } else if (cursors.right.isDown && cursors.down.isDown) {
    gridEngine.move('player', Direction.DOWN_RIGHT);
  } else if (cursors.left.isDown) {
    gridEngine.move('player', Direction.LEFT);
  } else if (cursors.right.isDown) {
    gridEngine.move('player', Direction.RIGHT);
  } else if (cursors.up.isDown) {
    gridEngine.move('player', Direction.UP);
  } else if (cursors.down.isDown) {
    gridEngine.move('player', Direction.DOWN);
  }
};

export { handlePlayerMovement };
