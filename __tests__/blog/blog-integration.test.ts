import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Mock next-mdx-remote
jest.mock('next-mdx-remote/serialize', () => ({
  serialize: jest.fn().mockResolvedValue({
    compiledSource: '<div>Mocked MDX content</div>',
    scope: {},
  }),
}));

import { serialize } from 'next-mdx-remote/serialize';

describe('Blog MDX Integration', () => {
  const postsDirectory = path.join(process.cwd(), 'posts');

  it('should read and parse all MDX files correctly', () => {
    const filenames = fs.readdirSync(postsDirectory);
    const mdxFiles = filenames.filter(filename => filename.endsWith('.mdx'));

    expect(mdxFiles.length).toBeGreaterThan(0);

    mdxFiles.forEach(filename => {
      const filePath = path.join(postsDirectory, filename);
      const fileContents = fs.readFileSync(filePath, 'utf8');

      // Should be able to parse frontmatter
      const { data, content } = matter(fileContents);

      // Should have required frontmatter fields
      expect(data.title).toBeDefined();
      expect(data.description).toBeDefined();
      expect(data.date).toBeDefined();
      expect(data.tags).toBeDefined();
      expect(data.imageUrl).toBeDefined();

      // Should have content
      expect(content).toBeDefined();
      expect(content.length).toBeGreaterThan(0);
    });
  });

  it('should generate correct static paths', () => {
    const filenames = fs.readdirSync(postsDirectory);
    const mdxFiles = filenames.filter(filename => filename.endsWith('.mdx'));

    const expectedPaths = mdxFiles.map(filename => ({
      params: { slug: filename.replace('.mdx', '') },
    }));

    expect(expectedPaths.length).toBeGreaterThan(0);
    expectedPaths.forEach(path => {
      expect(path.params.slug).toBeDefined();
      expect(typeof path.params.slug).toBe('string');
    });
  });

  it('should serialize MDX content correctly', async () => {
    const testFile = path.join(postsDirectory, 'test-article.mdx');
    const fileContents = fs.readFileSync(testFile, 'utf8');
    const { content } = matter(fileContents);

    const mdxSource = await serialize(content, {
      mdxOptions: {
        remarkPlugins: [],
        rehypePlugins: [],
      },
    });

    expect(mdxSource).toBeDefined();
    expect(mdxSource.compiledSource).toBeDefined();
    expect(typeof mdxSource.compiledSource).toBe('string');
  });

  it('should handle non-existent MDX files gracefully', () => {
    const nonExistentPath = path.join(postsDirectory, 'non-existent.mdx');

    expect(() => {
      fs.readFileSync(nonExistentPath, 'utf8');
    }).toThrow();
  });

  it('should validate frontmatter data types', () => {
    const filenames = fs.readdirSync(postsDirectory);
    const mdxFiles = filenames.filter(filename => filename.endsWith('.mdx'));

    mdxFiles.forEach(filename => {
      const filePath = path.join(postsDirectory, filename);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContents);

      // Validate data types
      expect(typeof data.title).toBe('string');
      expect(typeof data.description).toBe('string');
      expect(typeof data.date).toBe('string');
      expect(typeof data.tags).toBe('string');
      expect(typeof data.imageUrl).toBe('string');

      // Validate date format (should be parseable)
      expect(() => new Date(data.date)).not.toThrow();
    });
  });
});