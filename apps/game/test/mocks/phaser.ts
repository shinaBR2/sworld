import { jest } from '@jest/globals';

export const mockPhaser = {
  Physics: {
    Matter: {
      Sprite: class {
        scene: any;
        body: any;
        active: boolean = true;
        anims = {
          play: function () {
            return this;
          },
        };
        on: (event: string, callback: MutationCallback, context: any) => this = () => this;

        constructor(world: any, _x: number, _y: number, _texture: string) {
          this.scene = world.scene;
          this.body = { velocity: { x: 0, y: 0 } };
        }

        setFixedRotation() {
          return this;
        }
        setIgnoreGravity() {
          return this;
        }
        setVelocityX() {
          return this;
        }
      },
    },
  },
  Math: {
    RND: {
      pick: (arr: any[]) => arr[0],
    },
  },
};

export const mockScene = () => ({
  matter: {
    world: {
      add: jest.fn(),
    },
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
});

export const mockPhysics = () => ({
  setFixedRotation: jest.fn(),
  setIgnoreGravity: jest.fn(),
  setVelocityX: jest.fn(),
});
