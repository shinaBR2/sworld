import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import Bat from './bat';

describe('Bat', () => {
  let bat: Bat;
  let mockScene: any;

  beforeEach(() => {
    mockScene = {
      matter: {
        world: { scene: {} },
      },
      add: {
        existing: jest.fn(),
      },
      events: {
        on: jest.fn(),
      },
      matterCollision: {
        addOnCollideStart: jest.fn(),
      },
    };

    bat = new Bat(mockScene as any, 100, 100);
  });

  test('should initialize with correct properties', () => {
    expect(bat.label).toBe('bat');
    expect(bat.dead).toBeFalsy();
  });
});
