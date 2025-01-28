import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Express } from 'express';
import express from 'express';
import helmet from 'helmet';
import { createBaseApp } from './base-app';

// Define types for our mocked Express
type MockExpress = {
  (): Express;
  json: ReturnType<typeof vi.fn>;
  urlencoded: ReturnType<typeof vi.fn>;
} & ReturnType<typeof vi.fn>;

// Mock Express and its middleware
vi.mock('express', () => {
  const mockRouter = {
    use: vi.fn(),
  };

  const mockExpress = vi.fn(() => mockRouter) as MockExpress;
  mockExpress.json = vi.fn(() => 'jsonMiddleware');
  mockExpress.urlencoded = vi.fn(() => 'urlencodedMiddleware');

  return {
    default: mockExpress,
    __esModule: true,
  };
});

// Mock helmet
vi.mock('helmet', () => ({
  default: vi.fn(() => 'helmetMiddleware'),
  __esModule: true,
}));

// Mock logger
vi.mock('./logger', () => ({
  httpLogger: 'httpLoggerMiddleware',
}));

describe('createBaseApp', () => {
  let mockApp: Express & { use: ReturnType<typeof vi.fn> };
  let mockExpress: MockExpress;

  beforeEach(() => {
    vi.clearAllMocks();
    // Cast express to our mock type
    mockExpress = express as unknown as MockExpress;
    // Get the mock app instance created by express
    mockApp = mockExpress() as Express & { use: ReturnType<typeof vi.fn> };
  });

  it('should create an express app', () => {
    createBaseApp();
    expect(mockExpress).toHaveBeenCalled();
  });

  it('should set up http logger middleware', () => {
    createBaseApp();
    expect(mockApp.use).toHaveBeenCalledWith('httpLoggerMiddleware');
  });

  it('should set up json middleware', () => {
    createBaseApp();
    expect(mockExpress.json).toHaveBeenCalled();
    expect(mockApp.use).toHaveBeenCalledWith('jsonMiddleware');
  });

  it('should set up urlencoded middleware with extended option', () => {
    createBaseApp();
    expect(mockExpress.urlencoded).toHaveBeenCalledWith({ extended: true });
    expect(mockApp.use).toHaveBeenCalledWith('urlencodedMiddleware');
  });

  it('should set up helmet middleware', () => {
    createBaseApp();
    expect(helmet).toHaveBeenCalled();
    expect(mockApp.use).toHaveBeenCalledWith('helmetMiddleware');
  });

  it('should set up middlewares in the correct order', () => {
    createBaseApp();

    const calls = mockApp.use.mock.calls;
    expect(calls[0][0]).toBe('httpLoggerMiddleware');
    expect(calls[1][0]).toBe('jsonMiddleware');
    expect(calls[2][0]).toBe('urlencodedMiddleware');
    expect(calls[3][0]).toBe('helmetMiddleware');
  });

  it('should return the configured express app', () => {
    const app = createBaseApp();
    expect(app).toBe(mockApp);
  });
});
