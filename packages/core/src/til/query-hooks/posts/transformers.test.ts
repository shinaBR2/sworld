import { describe, expect, it } from 'vitest';
import { transformPost } from './transformers';

describe('transformPost', () => {
  it('should correctly transform post data structure', () => {
    const mockData = {
      id: 'post-123',
      title: 'Test Post',
      brief: 'Sample brief description',
      markdown_content: '# Hello World\nTest content',
      readTimeInMinutes: 5
    };

    const result = transformPost(mockData);
    
    expect(result).toEqual({
      id: 'post-123',
      title: 'Test Post',
      brief: 'Sample brief description',
      mContent: '# Hello World\nTest content',
      readTimeInMinutes: 5
    });
  });
});