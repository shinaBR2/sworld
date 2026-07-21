import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hasuraClient } from 'src/services/hasura/client';
import { createDeviceRequest } from './index';
import {
  type CreateDeviceRequestMutation,
  CreateDeviceRequestMutationVariables,
  type Device_Requests_Insert_Input,
} from '../../../generated-graphql/graphql';

// Mock the hasura client
vi.mock('src/services/hasura/client', () => {
  const mockRequest = vi.fn();
  return {
    hasuraClient: {
      request: mockRequest,
    },
  };
});

describe('createDeviceRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockInput: Device_Requests_Insert_Input = {
    deviceCode: 'device-code',
    userCode: 'user-code',
    expiresAt: '2025-07-06T15:00:00Z',
    ipAddress: '127.0.0.1',
    userAgent: 'test-agent',
    status: 'pending',
    // Add other required fields as needed
  };

  const mockResponse: CreateDeviceRequestMutation = {
    insert_device_requests_one: {
      id: 'device-request-id',
      deviceCode: 'device-code',
      userCode: 'user-code',
    },
  };

  it('should call hasuraClient.request with correct parameters', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce(mockResponse);

    await createDeviceRequest(mockInput);

    expect(hasuraClient.request).toHaveBeenCalledWith({
      document: expect.stringContaining('mutation createDeviceRequest'),
      variables: {
        object: mockInput,
      },
    });
  });

  it('should return the inserted device request', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce(mockResponse);

    const result = await createDeviceRequest(mockInput);

    expect(result).toEqual(mockResponse.insert_device_requests_one);
  });

  it('should throw an error when hasuraClient.request fails', async () => {
    const mockError = new Error('GraphQL request failed');
    vi.mocked(hasuraClient.request).mockRejectedValueOnce(mockError);

    await expect(createDeviceRequest(mockInput)).rejects.toThrow(mockError);
  });

  it('should throw an error when insert_device_requests_one is missing', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce(
      {} as CreateDeviceRequestMutation,
    );

    await expect(createDeviceRequest(mockInput)).rejects.toThrow(
      'Failed to create device request',
    );
  });
});
