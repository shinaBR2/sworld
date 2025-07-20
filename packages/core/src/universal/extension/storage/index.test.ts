import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { setItem, getItems, removeItems } from './index';

// Define the Chrome storage API types
interface ChromeStorageArea {
  set: (items: Record<string, any>, callback?: () => void) => void;
  get: (keys: string | string[] | Record<string, any>, callback: (items: Record<string, any>) => void) => void;
  remove: (keys: string | string[], callback?: () => void) => void;
}

interface ChromeStorage {
  local: ChromeStorageArea;
}

interface Chrome {
  storage: ChromeStorage;
}

declare global {
  // eslint-disable-next-line no-var
  var chrome: Chrome;
}

// Create mock storage implementation
function createMockStorage() {
  return {
    set: vi.fn().mockImplementation((items: Record<string, any>) => {
      return Promise.resolve();
    }),
    get: vi.fn().mockImplementation((keys: string | string[] | Record<string, any>) => {
      return Promise.resolve({ testKey: 'testValue' });
    }),
    remove: vi.fn().mockImplementation((keys: string | string[]) => {
      return Promise.resolve();
    }),
  };
}

// Create mock chrome storage
const mockStorage = createMockStorage();

describe('Chrome Storage Utilities', () => {
  beforeAll(() => {
    // Setup global chrome object
    global.chrome = {
      storage: {
        local: mockStorage,
      },
    } as unknown as Chrome; // Cast to Chrome to satisfy TypeScript
  });

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Reset mock implementations
    mockStorage.set = createMockStorage().set;
    mockStorage.get = createMockStorage().get;
    mockStorage.remove = createMockStorage().remove;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('setItem', () => {
    it('should call chrome.storage.local.set with the correct parameters', async () => {
      const key = 'testKey';
      const value = 'testValue';

      await setItem(key, value);

      expect(mockStorage.set).toHaveBeenCalledWith({ [key]: value });

      // Verify the correct arguments were passed
      const call = (mockStorage.set as any).mock.calls[0];
      expect(call[0]).toEqual({ [key]: value });
    });

    it('should handle errors when setting an item', async () => {
      const error = new Error('Storage error');
      mockStorage.set.mockImplementationOnce(() => Promise.reject(error));

      await expect(setItem('testKey', 'testValue')).rejects.toThrow('Storage error');
    });
  });

  describe('getItems', () => {
    it('should call chrome.storage.local.get with the correct keys and return data', async () => {
      const keys = ['key1', 'key2'];
      const mockData = { testKey: 'testValue' };

      mockStorage.get.mockResolvedValueOnce(mockData);

      const result = await getItems(keys);

      // Verify the correct keys were passed
      expect(mockStorage.get).toHaveBeenCalledWith(keys);

      // Verify the result matches our mock data
      expect(result).toEqual(mockData);
    });

    it('should handle errors when getting items', async () => {
      const error = new Error('Storage error');
      mockStorage.get.mockImplementationOnce(() => Promise.reject(error));

      await expect(getItems(['key1'])).rejects.toThrow('Storage error');
    });
  });

  describe('removeItems', () => {
    it('should call chrome.storage.local.remove with the correct keys', async () => {
      const keys = ['key1', 'key2'];

      await removeItems(keys);

      // Verify the correct keys were passed
      expect(mockStorage.remove).toHaveBeenCalledWith(keys);
    });

    it('should handle errors when removing items', async () => {
      const error = new Error('Storage error');
      mockStorage.remove.mockImplementationOnce(() => Promise.reject(error));

      await expect(removeItems(['key1'])).rejects.toThrow('Storage error');
    });
  });
});
