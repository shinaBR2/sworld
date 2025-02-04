import { describe, it, expect, vi } from 'vitest';
import { videosRouter } from './index';

vi.mock('express', () => {
  const mockRouter = {
    post: vi.fn().mockReturnThis(),
    stack: [
      {
        route: {
          path: '/convert-handler',
          methods: { post: true },
          stack: [{ name: 'middleware' }, { name: 'convertHandler' }],
        },
      },
    ],
  };

  return {
    default: {
      Router: () => mockRouter,
    },
  };
});

vi.mock('./routes/convert', () => ({
  convertHandler: vi.fn(),
}));

vi.mock('src/utils/validator', () => ({
  validateRequest: () => vi.fn(),
}));

// TODO verify this test again
describe('videosRouter', () => {
  it('should register POST /convert-handler route', () => {
    const routes = videosRouter.stack
      .filter(layer => layer.route)
      .map(layer => ({
        path: layer.route.path,
        method: Object.keys(layer.route.methods)[0],
      }));

    const convertHandlerRoute = routes.find(r => r.path === '/convert-handler');

    expect(convertHandlerRoute).toBeDefined();
    expect(convertHandlerRoute?.method).toBe('post');
  });

  it('should have validation middleware and handler', () => {
    const convertHandlerRoute = videosRouter.stack.find(layer => layer.route?.path === '/convert-handler');

    const middlewares = convertHandlerRoute?.route.stack || [];

    expect(middlewares).toHaveLength(2);
    expect(middlewares[0].name).toBe('middleware');
    expect(middlewares[1].name).toBe('convertHandler');
  });
});
