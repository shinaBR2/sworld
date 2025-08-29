import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type GridEngine from 'grid-engine';
import { Direction } from 'grid-engine';
import type { Types } from 'phaser';
import { handlePlayerMovement } from './movement';

describe('handlePlayerMovement', () => {
  let mockGridEngine: jest.Mocked<GridEngine>;
  let mockCursors: jest.Mocked<Types.Input.Keyboard.CursorKeys>;

  beforeEach(() => {
    // Mock GridEngine
    mockGridEngine = {
      move: jest.fn(),
    } as unknown as jest.Mocked<GridEngine>;

    // Mock cursors
    mockCursors = {
      left: { isDown: false },
      right: { isDown: false },
      up: { isDown: false },
      down: { isDown: false },
    } as unknown as jest.Mocked<Types.Input.Keyboard.CursorKeys>;
  });

  it('should move UP_LEFT when left and up are pressed', () => {
    // Arrange
    mockCursors.left.isDown = true;
    mockCursors.up.isDown = true;

    // Act
    handlePlayerMovement({ cursors: mockCursors, gridEngine: mockGridEngine });

    // Assert
    expect(mockGridEngine.move).toHaveBeenCalledWith(
      'player',
      Direction.UP_LEFT,
    );
  });

  it('should move DOWN_LEFT when left and down are pressed', () => {
    mockCursors.left.isDown = true;
    mockCursors.down.isDown = true;

    handlePlayerMovement({ cursors: mockCursors, gridEngine: mockGridEngine });

    expect(mockGridEngine.move).toHaveBeenCalledWith(
      'player',
      Direction.DOWN_LEFT,
    );
  });

  it('should move UP_RIGHT when right and up are pressed', () => {
    mockCursors.right.isDown = true;
    mockCursors.up.isDown = true;

    handlePlayerMovement({ cursors: mockCursors, gridEngine: mockGridEngine });

    expect(mockGridEngine.move).toHaveBeenCalledWith(
      'player',
      Direction.UP_RIGHT,
    );
  });

  it('should move DOWN_RIGHT when right and down are pressed', () => {
    mockCursors.right.isDown = true;
    mockCursors.down.isDown = true;

    handlePlayerMovement({ cursors: mockCursors, gridEngine: mockGridEngine });

    expect(mockGridEngine.move).toHaveBeenCalledWith(
      'player',
      Direction.DOWN_RIGHT,
    );
  });

  it('should move LEFT when only left is pressed', () => {
    mockCursors.left.isDown = true;

    handlePlayerMovement({ cursors: mockCursors, gridEngine: mockGridEngine });

    expect(mockGridEngine.move).toHaveBeenCalledWith('player', Direction.LEFT);
  });

  it('should move RIGHT when only right is pressed', () => {
    mockCursors.right.isDown = true;

    handlePlayerMovement({ cursors: mockCursors, gridEngine: mockGridEngine });

    expect(mockGridEngine.move).toHaveBeenCalledWith('player', Direction.RIGHT);
  });

  it('should move UP when only up is pressed', () => {
    mockCursors.up.isDown = true;

    handlePlayerMovement({ cursors: mockCursors, gridEngine: mockGridEngine });

    expect(mockGridEngine.move).toHaveBeenCalledWith('player', Direction.UP);
  });

  it('should move DOWN when only down is pressed', () => {
    mockCursors.down.isDown = true;

    handlePlayerMovement({ cursors: mockCursors, gridEngine: mockGridEngine });

    expect(mockGridEngine.move).toHaveBeenCalledWith('player', Direction.DOWN);
  });

  it('should not move when no keys are pressed', () => {
    handlePlayerMovement({ cursors: mockCursors, gridEngine: mockGridEngine });

    expect(mockGridEngine.move).not.toHaveBeenCalled();
  });

  it('should prioritize diagonal movement over single direction', () => {
    // Test all combinations to ensure proper priority
    const diagonalCombos = [
      {
        keys: { left: true, up: true, right: false, down: false },
        expected: Direction.UP_LEFT,
      },
      {
        keys: { left: true, down: true, right: false, up: false },
        expected: Direction.DOWN_LEFT,
      },
      {
        keys: { right: true, up: true, left: false, down: false },
        expected: Direction.UP_RIGHT,
      },
      {
        keys: { right: true, down: true, left: false, up: false },
        expected: Direction.DOWN_RIGHT,
      },
    ];

    diagonalCombos.forEach(({ keys, expected }) => {
      // Reset the mock
      jest.clearAllMocks();

      // Set up the key combinations
      mockCursors.left.isDown = keys.left;
      mockCursors.right.isDown = keys.right;
      mockCursors.up.isDown = keys.up;
      mockCursors.down.isDown = keys.down;

      handlePlayerMovement({
        cursors: mockCursors,
        gridEngine: mockGridEngine,
      });

      expect(mockGridEngine.move).toHaveBeenCalledWith('player', expected);
      expect(mockGridEngine.move).toHaveBeenCalledTimes(1);
    });
  });
});
