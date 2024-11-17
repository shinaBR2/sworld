import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { Firestore } from 'firebase/firestore';
import {
  useAddDoc,
  useDeleteDoc,
  useGetCollectionOn,
  useUpdateDoc,
} from '../universal/dbQuery';
import {
  audioConverter,
  useListenEntityList,
  useAddEntity,
  useUpdateEntity,
  useDeleteEntity,
} from './audio';
import {
  AddDocInputs,
  BaseFirestoreInputs,
} from '../universal/dbQuery/interfaces';

// Mock the custom hooks
jest.mock('../universal/dbQuery', () => ({
  useAddDoc: jest.fn(),
  useDeleteDoc: jest.fn(),
  useGetCollectionOn: jest.fn(),
  useUpdateDoc: jest.fn(),
}));

describe('Audio Hooks', () => {
  let mockDb: jest.Mocked<Firestore>;

  beforeEach(() => {
    mockDb = {
      // Add necessary Firestore mock properties
    } as unknown as jest.Mocked<Firestore>;

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('audioConverter', () => {
    const mockAudioItem = {
      id: '123',
      src: 'audio.mp3',
      name: 'Test Audio',
      artistName: 'Test Artist',
      image: 'image.jpg',
      feelingMap: {},
      uploaderId: 'user1',
      editorId: 'editor1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should convert to Firestore format', () => {
      const result = audioConverter.toFirestore(mockAudioItem);
      expect(result).toEqual({
        ...mockAudioItem,
        thumbnailUrl: mockAudioItem.image,
        image: undefined,
      });
    });

    it('should convert from Firestore format', () => {
      const mockSnapshot = {
        id: mockAudioItem.id,
        data: () => ({
          ...mockAudioItem,
          thumbnailUrl: mockAudioItem.image,
        }),
      };

      const result = audioConverter.fromFirestore(
        mockSnapshot as any,
        {} as any
      );

      expect(result).toEqual(mockAudioItem);
    });
  });

  describe('useListenEntityList', () => {
    it('should return values, loading, and error states', () => {
      const mockReturn = {
        values: [{ id: '1', name: 'Test' }],
        loading: false,
        error: null,
      };

      (useGetCollectionOn as jest.Mock).mockReturnValue(mockReturn);

      const result = useListenEntityList(mockDb);

      expect(useGetCollectionOn).toHaveBeenCalledWith({
        db: mockDb,
        path: '/audios',
        pathSegments: [''],
        converter: audioConverter,
      });

      expect(result).toEqual(mockReturn);
    });
  });

  describe('useAddEntity', () => {
    it('should add an entity and return its ID', async () => {
      const mockId = '123';
      const mockAddDoc = jest
        .fn<(inputs: AddDocInputs) => Promise<string>>()
        .mockResolvedValue(mockId);
      (useAddDoc as jest.Mock).mockReturnValue(mockAddDoc);

      const addEntity = useAddEntity(mockDb);
      const mockInput = {
        name: 'Test Audio',
        image: 'test.jpg',
      };

      // @ts-ignore
      const result = await addEntity(mockInput);

      expect(mockAddDoc).toHaveBeenCalledWith({
        db: mockDb,
        path: '/audios',
        pathSegments: [''],
        data: expect.objectContaining({
          thumbnailUrl: 'test.jpg',
        }),
      });

      expect(result).toBe(mockId);
    });
  });

  describe('useUpdateEntity', () => {
    it('should update an entity', async () => {
      const mockUpdateDoc = jest
        .fn<(inputs: AddDocInputs) => Promise<void>>()
        .mockResolvedValue();
      (useUpdateDoc as jest.Mock).mockReturnValue(mockUpdateDoc);

      const updateEntity = useUpdateEntity(mockDb);
      const mockInput = {
        id: '123',
        name: 'Updated Audio',
        image: 'updated.jpg',
      };

      // @ts-ignore
      await updateEntity(mockInput);

      expect(mockUpdateDoc).toHaveBeenCalledWith({
        db: mockDb,
        path: '/audios',
        pathSegments: ['', '123'],
        data: expect.objectContaining({
          thumbnailUrl: 'updated.jpg',
        }),
      });
    });
  });

  describe('useDeleteEntity', () => {
    it('should delete an entity', async () => {
      const mockDeleteDoc = jest
        .fn<(inputs: BaseFirestoreInputs) => Promise<void>>()
        .mockResolvedValue();
      (useDeleteDoc as jest.Mock).mockReturnValue(mockDeleteDoc);

      const deleteEntity = useDeleteEntity(mockDb);
      await deleteEntity('123');

      expect(mockDeleteDoc).toHaveBeenCalledWith({
        db: mockDb,
        path: '/audios',
        pathSegments: ['', '123'],
      });
    });
  });
});
