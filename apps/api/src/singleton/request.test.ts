import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { FieldValue } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/v2/https';

// Mock firebase-functions/v2
jest.mock('firebase-functions/v2', () => ({
  setGlobalOptions: jest.fn(),
}));

// Mock firebase-functions/v2/https
jest.mock('firebase-functions/v2/https', () => ({
  HttpsError: jest.fn().mockImplementation((code, message) => ({
    code,
    message,
    httpsError: true, // Helper flag for testing
  })),
  onRequest: jest.fn((options, handler) => handler),
  onCall: jest.fn(handler => handler),
}));

// Mock firebase-admin/firestore
jest.mock('firebase-admin/firestore', () => ({
  FieldValue: {
    serverTimestamp: jest.fn().mockReturnValue('mocked-timestamp'),
  },
}));

// Import our functions after mocking dependencies
import {
  onRequest,
  AppError,
  getTimeStamp,
  onRequestWithCors,
} from './request';

describe('Firebase Functions Utilities', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AppError', () => {
    it('should throw HttpsError with "ok" status code', () => {
      const errorMessage = 'Test error message';

      expect(() => {
        AppError(errorMessage);
      }).toThrow();

      // Verify HttpsError was called with correct parameters
      expect(HttpsError).toHaveBeenCalledWith('ok', errorMessage);
    });
  });

  describe('onRequestWithCors', () => {
    it('should create a request handler with CORS enabled', async () => {
      const mockHandler = jest.fn();
      //@ts-ignore
      onRequestWithCors(mockHandler);

      // Verify the handler was created with CORS options
      expect(onRequest).toHaveBeenCalledWith(
        { cors: true },
        expect.any(Function)
      );
    });
  });

  describe('getTimeStamp', () => {
    it('should return server timestamp', () => {
      const timestamp = getTimeStamp();
      expect(timestamp).toBe('mocked-timestamp');
      expect(FieldValue.serverTimestamp).toHaveBeenCalled();
    });
  });
});
