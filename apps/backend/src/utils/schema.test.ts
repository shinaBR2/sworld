import { describe, it, expect } from 'vitest';
import { AppError, AppResponse } from './schema';

describe('Schema Utils', () => {
  describe('AppError', () => {
    it('should create an error response with just message', () => {
      const result = AppError('Something went wrong');
      expect(result).toEqual({
        success: false,
        message: 'Something went wrong',
      });
    });

    it('should create an error response with message and error object', () => {
      const error = { code: 500, details: 'Server error' };
      const result = AppError('Something went wrong', error);
      expect(result).toEqual({
        success: false,
        message: 'Something went wrong',
        dataObject: error,
      });
    });

    it('should handle null error object', () => {
      const result = AppError('Something went wrong', null);
      expect(result).toEqual({
        success: false,
        message: 'Something went wrong',
        dataObject: null,
      });
    });

    it('should handle undefined error object', () => {
      const result = AppError('Something went wrong', undefined);
      expect(result).toEqual({
        success: false,
        message: 'Something went wrong',
      });
    });

    it('should work with complex error objects', () => {
      const error = {
        errors: [
          { field: 'email', message: 'Invalid email' },
          { field: 'password', message: 'Too short' },
        ],
        timestamp: new Date(),
      };
      const result = AppError('Validation failed', error);
      expect(result).toEqual({
        success: false,
        message: 'Validation failed',
        dataObject: error,
      });
    });
  });

  describe('AppResponse', () => {
    it('should create a success response', () => {
      const result = AppResponse(true, 'Operation successful');
      expect(result).toEqual({
        success: true,
        message: 'Operation successful',
      });
    });

    it('should create a success response with data', () => {
      const data = { id: 1, name: 'Test' };
      const result = AppResponse(true, 'Operation successful', data);
      expect(result).toEqual({
        success: true,
        message: 'Operation successful',
        dataObject: data,
      });
    });

    it('should create a fail response', () => {
      const result = AppResponse(false, 'Operation failed');
      expect(result).toEqual({
        success: false,
        message: 'Operation failed',
      });
    });

    it('should create a fail response with data', () => {
      const data = { reason: 'Invalid input' };
      const result = AppResponse(false, 'Operation failed', data);
      expect(result).toEqual({
        success: false,
        message: 'Operation failed',
        dataObject: data,
      });
    });

    it('should handle undefined data', () => {
      const result = AppResponse(true, 'Success', undefined);
      expect(result).toEqual({
        success: true,
        message: 'Success',
      });
    });

    it('should handle null data', () => {
      const result = AppResponse(true, 'Success', null);
      expect(result).toEqual({
        success: true,
        message: 'Success',
        dataObject: null,
      });
    });

    it('should work with different data types', () => {
      // Array
      expect(AppResponse(true, 'Success', [1, 2, 3])).toEqual({
        success: true,
        message: 'Success',
        dataObject: [1, 2, 3],
      });

      // Number
      expect(AppResponse(true, 'Success', 42)).toEqual({
        success: true,
        message: 'Success',
        dataObject: 42,
      });

      // String
      expect(AppResponse(true, 'Success', 'data')).toEqual({
        success: true,
        message: 'Success',
        dataObject: 'data',
      });
    });
  });

  describe('Type Safety', () => {
    it('should maintain type safety with generics', () => {
      interface User {
        id: number;
        name: string;
      }

      const user: User = { id: 1, name: 'Test' };

      // These should compile without type errors
      const successResponse = AppResponse<User>(true, 'Success', user);
      const errorResponse = AppError<Error>(
        'Error occurred',
        new Error('Test error')
      );

      expect(successResponse.dataObject?.id).toBe(1);
      expect(successResponse.dataObject?.name).toBe('Test');
      expect(errorResponse.dataObject?.message).toBe('Test error');
    });
  });
});
