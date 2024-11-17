import { GridEngine } from 'grid-engine';
import { Tilemaps, Input } from 'phaser';

interface CheckTileInteractionParams {
  gridEngine: GridEngine;
  layer: Tilemaps.TilemapLayer;
  propertyKey: string;
  characterId?: string;
  onInteract: (tile: Tilemaps.Tile) => void;
  interactKey: Input.Keyboard.Key;
}

const checkTileInteraction = (params: CheckTileInteractionParams): boolean => {
  const {
    gridEngine,
    layer,
    propertyKey,
    characterId = 'player',
    onInteract,
    interactKey,
  } = params;

  const position = gridEngine.getPosition(characterId);
  const facing = gridEngine.getFacingDirection(characterId);

  const tilePos = {
    x: position.x + (facing === 'right' ? 1 : facing === 'left' ? -1 : 0),
    y: position.y + (facing === 'down' ? 1 : facing === 'up' ? -1 : 0),
  };

  const tile = layer.getTileAt(tilePos.x, tilePos.y);
  const canInteract = tile?.properties?.[propertyKey];

  if (canInteract && Phaser.Input.Keyboard.JustDown(interactKey)) {
    onInteract(tile!); // Non-null assertion because we checked canInteract
  }

  return Boolean(canInteract);
};

export { checkTileInteraction };
