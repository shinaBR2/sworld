import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { Direction, GridEngine } from 'grid-engine';
import type { Input, Tilemaps } from 'phaser';
import { checkTileInteraction } from './tileInteraction';

describe('checkTileInteraction', () => {
  // Mock setup
  let mockGridEngine: jest.Mocked<GridEngine>;
  let mockLayer: jest.Mocked<Tilemaps.TilemapLayer>;
  let mockInteractKey: jest.Mocked<Input.Keyboard.Key>;
  let mockTile: jest.Mocked<Tilemaps.Tile>;
  let mockOnInteract: jest.Mock;

  beforeEach(() => {
    // Reset all mocks before each test
    mockGridEngine = {
      getPosition: jest.fn(),
      getFacingDirection: jest.fn(),
    } as unknown as jest.Mocked<GridEngine>;

    mockTile = {
      properties: {},
    } as unknown as jest.Mocked<Tilemaps.Tile>;

    mockLayer = {
      getTileAt: jest.fn(),
    } as unknown as jest.Mocked<Tilemaps.TilemapLayer>;

    mockInteractKey = {} as unknown as jest.Mocked<Input.Keyboard.Key>;

    mockOnInteract = jest.fn();

    // Mock Phaser's keyboard input
    (global as any).Phaser = {
      Input: {
        Keyboard: {
          JustDown: jest.fn(),
        },
      },
    };
  });

  it('should return false when no tile is found', () => {
    // Arrange
    mockGridEngine.getPosition.mockReturnValue({ x: 0, y: 0 });
    mockGridEngine.getFacingDirection.mockReturnValue('right' as Direction);
    // @ts-expect-error
    mockLayer.getTileAt.mockReturnValue(null);

    // Act
    const result = checkTileInteraction({
      gridEngine: mockGridEngine,
      layer: mockLayer,
      propertyKey: 'isHouseSign',
      interactKey: mockInteractKey,
      onInteract: mockOnInteract,
    });

    // Assert
    expect(result).toBe(false);
    expect(mockOnInteract).not.toHaveBeenCalled();
  });

  it('should return true when facing an interactive tile', () => {
    // Arrange
    mockGridEngine.getPosition.mockReturnValue({ x: 0, y: 0 });
    mockGridEngine.getFacingDirection.mockReturnValue('right' as Direction);
    mockTile.properties.isHouseSign = true;
    mockLayer.getTileAt.mockReturnValue(mockTile);

    // Act
    const result = checkTileInteraction({
      gridEngine: mockGridEngine,
      layer: mockLayer,
      propertyKey: 'isHouseSign',
      interactKey: mockInteractKey,
      onInteract: mockOnInteract,
    });

    // Assert
    expect(result).toBe(true);
  });

  it('should call onInteract when pressing interact key near interactive tile', () => {
    // Arrange
    mockGridEngine.getPosition.mockReturnValue({ x: 0, y: 0 });
    mockGridEngine.getFacingDirection.mockReturnValue('right' as Direction);
    mockTile.properties.isHouseSign = true;
    mockLayer.getTileAt.mockReturnValue(mockTile);
    (Phaser.Input.Keyboard.JustDown as jest.Mock).mockReturnValue(true);

    // Act
    checkTileInteraction({
      gridEngine: mockGridEngine,
      layer: mockLayer,
      propertyKey: 'isHouseSign',
      interactKey: mockInteractKey,
      onInteract: mockOnInteract,
    });

    // Assert
    expect(mockOnInteract).toHaveBeenCalledWith(mockTile);
  });

  it('should check correct tile position based on facing direction', () => {
    // Test all directions
    const directions = [
      { facing: 'right', expectedX: 1, expectedY: 0 },
      { facing: 'left', expectedX: -1, expectedY: 0 },
      { facing: 'up', expectedX: 0, expectedY: -1 },
      { facing: 'down', expectedX: 0, expectedY: 1 },
    ];

    directions.forEach(({ facing, expectedX, expectedY }) => {
      // Arrange
      mockGridEngine.getPosition.mockReturnValue({ x: 0, y: 0 });
      mockGridEngine.getFacingDirection.mockReturnValue(facing as Direction);

      // Act
      checkTileInteraction({
        gridEngine: mockGridEngine,
        layer: mockLayer,
        propertyKey: 'isHouseSign',
        interactKey: mockInteractKey,
        onInteract: mockOnInteract,
      });

      // Assert
      expect(mockLayer.getTileAt).toHaveBeenCalledWith(expectedX, expectedY);
    });
  });

  it('should use default characterId when not provided', () => {
    // Arrange
    mockGridEngine.getPosition.mockReturnValue({ x: 0, y: 0 });
    mockGridEngine.getFacingDirection.mockReturnValue('right' as Direction);

    // Act
    checkTileInteraction({
      gridEngine: mockGridEngine,
      layer: mockLayer,
      propertyKey: 'isHouseSign',
      interactKey: mockInteractKey,
      onInteract: mockOnInteract,
    });

    // Assert
    expect(mockGridEngine.getPosition).toHaveBeenCalledWith('player');
    expect(mockGridEngine.getFacingDirection).toHaveBeenCalledWith('player');
  });

  it('should use provided characterId when specified', () => {
    // Arrange
    mockGridEngine.getPosition.mockReturnValue({ x: 0, y: 0 });
    mockGridEngine.getFacingDirection.mockReturnValue('right' as Direction);

    // Act
    checkTileInteraction({
      gridEngine: mockGridEngine,
      layer: mockLayer,
      propertyKey: 'isHouseSign',
      characterId: 'npc1',
      interactKey: mockInteractKey,
      onInteract: mockOnInteract,
    });

    // Assert
    expect(mockGridEngine.getPosition).toHaveBeenCalledWith('npc1');
    expect(mockGridEngine.getFacingDirection).toHaveBeenCalledWith('npc1');
  });
});
