import { getAllPosts, getAllPostsSlugs, getSinglePost, getPostsDirectory } from '../postsFetcher';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs and path modules
jest.mock('fs');
jest.mock('path');

const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedPath = path as jest.Mocked<typeof path>;

describe('postsFetcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock process.cwd()
    Object.defineProperty(process, 'cwd', {
      value: jest.fn(() => '/test/path'),
      configurable: true,
    });

    // Mock path.join
    mockedPath.join.mockImplementation((...args) => args.join('/'));

    // Mock fs.readdirSync
    (mockedFs.readdirSync as jest.Mock).mockReturnValue(['test-article.mdx', 'another-article.mdx']);

    // Mock fs.readFileSync
    mockedFs.readFileSync.mockReturnValue(`---
title: Test Article
date: 2023-01-01
author: Test Author
---

# Test Article

This is a test article content.
`);
  });

  describe('getPostsDirectory', () => {
    it('should return the correct posts directory path', () => {
      const result = getPostsDirectory();
      expect(result).toBe('/test/path/posts');
      expect(mockedPath.join).toHaveBeenCalledWith('/test/path', 'posts');
    });
  });

  describe('getAllPostsSlugs', () => {
    it('should return normalized post slugs', () => {
      const result = getAllPostsSlugs();
      expect(result).toEqual(['test-article', 'another-article']);
      expect(mockedFs.readdirSync).toHaveBeenCalledWith('/test/path/posts');
    });

    it('should handle empty directory', () => {
      mockedFs.readdirSync.mockReturnValue([]);
      const result = getAllPostsSlugs();
      expect(result).toEqual([]);
    });
  });

  describe('getSinglePost', () => {
    it('should return parsed post data', async () => {
      const result = await getSinglePost('test-article');

      expect(result).toEqual({
        slug: 'test-article',
        content: '\n# Test Article\n\nThis is a test article content.\n',
        meta: {
          title: 'Test Article',
          date: new Date('2023-01-01'),
          author: 'Test Author',
        },
      });

      expect(mockedPath.join).toHaveBeenCalledWith('/test/path/posts', 'test-article.mdx');
      expect(mockedFs.readFileSync).toHaveBeenCalledWith('/test/path/posts/test-article.mdx', 'utf8');
    });

    it('should handle file read errors', async () => {
      mockedFs.readFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      await expect(getSinglePost('nonexistent')).rejects.toThrow('File not found');
    });
  });

  describe('getAllPosts', () => {
    it('should return all posts', async () => {
      const result = await getAllPosts();

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('slug', 'test-article');
      expect(result[1]).toHaveProperty('slug', 'another-article');
    });

    it('should handle empty posts directory', async () => {
      mockedFs.readdirSync.mockReturnValue([]);
      const result = await getAllPosts();
      expect(result).toEqual([]);
    });
  });
});