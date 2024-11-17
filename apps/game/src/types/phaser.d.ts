declare namespace Phaser.Physics.Matter {
  namespace Matter {
    interface Constraint {
      pointA: any;
      pointB: any;
      bodyA: any;
      bodyB: any;
      // add other properties you need
    }

    interface Body {
      velocity: { x: number; y: number };
      // add other properties you need
    }

    interface Bodies {
      rectangle: (
        x: number,
        y: number,
        width: number,
        height: number,
        options?: any
      ) => Body;
      circle: (x: number, y: number, radius: number, options?: any) => Body;
      // add other methods you need
    }

    const Constraint: {
      create: (options: any) => Constraint;
    };
    const Body: any;
    const Bodies: Bodies;
  }
}
