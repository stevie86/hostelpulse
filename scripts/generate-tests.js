#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Test-First Mode Test Generation Script
 * Generates boilerplate test files for components, hooks, utils, and API routes
 */

const args = process.argv.slice(2);
const [filePath, testType] = args;

if (!filePath) {
  console.log('Usage: node scripts/generate-tests.js <file-path> [test-type]');
  console.log('Example: node scripts/generate-tests.js components/Button.tsx');
  console.log('Test types: unit, integration, e2e (default: unit)');
  process.exit(1);
}

const absolutePath = path.resolve(filePath);
const fileName = path.basename(filePath, path.extname(filePath));
const dirName = path.dirname(filePath);
const testDir = path.join(dirName, '__tests__');
const testFileName = `${fileName}.test${path.extname(filePath)}`;
const testFilePath = path.join(testDir, testFileName);

const type = testType || 'unit';

// Ensure test directory exists
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

// Generate test content based on file type
function generateTestContent() {
  const ext = path.extname(filePath);

  if (ext === '.tsx' || ext === '.jsx') {
    return generateReactTest();
  } else if (ext === '.ts' || ext === '.js') {
    if (filePath.includes('/api/')) {
      return generateApiTest();
    } else if (filePath.includes('/hooks/')) {
      return generateHookTest();
    } else if (filePath.includes('/utils/')) {
      return generateUtilTest();
    } else {
      return generateGenericTest();
    }
  }

  return generateGenericTest();
}

function generateReactTest() {
  return `import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import ${fileName} from '../${fileName}';

describe('${fileName}', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      // TODO: Implement basic rendering test
      expect(true).toBe(true);
    });

    it('should render with default props', () => {
      // TODO: Test default prop values
      expect(true).toBe(true);
    });
  });

  describe('Interactions', () => {
    it('should handle user interactions correctly', () => {
      // TODO: Test user interactions (clicks, inputs, etc.)
      expect(true).toBe(true);
    });
  });

  describe('Props and State', () => {
    it('should accept and use props correctly', () => {
      // TODO: Test prop passing and usage
      expect(true).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle error states gracefully', () => {
      // TODO: Test error handling
      expect(true).toBe(true);
    });

    it('should handle loading states', () => {
      // TODO: Test loading states
      expect(true).toBe(true);
    });
  });
});
`;
}

function generateHookTest() {
  return `import { renderHook, act } from '@testing-library/react';
import { jest } from '@jest/globals';
import { ${fileName} } from '../${fileName}';

describe('${fileName}', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should return initial state', () => {
      // TODO: Test initial hook state
      expect(true).toBe(true);
    });
  });

  describe('State Updates', () => {
    it('should update state correctly', () => {
      // TODO: Test state update logic
      expect(true).toBe(true);
    });
  });

  describe('Side Effects', () => {
    it('should handle side effects properly', () => {
      // TODO: Test useEffect, API calls, etc.
      expect(true).toBe(true);
    });
  });

  describe('Cleanup', () => {
    it('should clean up resources on unmount', () => {
      // TODO: Test cleanup logic
      expect(true).toBe(true);
    });
  });
});
`;
}

function generateApiTest() {
  return `import { createMocks } from 'node-mocks-http';
import { jest } from '@jest/globals';
import handler from '../${fileName}';

describe('/api/${fileName}', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET requests', () => {
    it('should handle GET requests', async () => {
      // TODO: Test GET request handling
      expect(true).toBe(true);
    });

    it('should return correct response format', async () => {
      // TODO: Test response structure
      expect(true).toBe(true);
    });
  });

  describe('POST requests', () => {
    it('should handle POST requests', async () => {
      // TODO: Test POST request handling
      expect(true).toBe(true);
    });

    it('should validate request body', async () => {
      // TODO: Test input validation
      expect(true).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid requests', async () => {
      // TODO: Test error scenarios
      expect(true).toBe(true);
    });

    it('should return appropriate error responses', async () => {
      // TODO: Test error response format
      expect(true).toBe(true);
    });
  });

  describe('Authentication', () => {
    it('should require authentication', async () => {
      // TODO: Test authentication requirements
      expect(true).toBe(true);
    });
  });
});
`;
}

function generateUtilTest() {
  return `import { jest } from '@jest/globals';
import { ${fileName} } from '../${fileName}';

describe('${fileName}', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Core Functionality', () => {
    it('should perform its primary function', () => {
      // TODO: Test main utility function
      expect(true).toBe(true);
    });

    it('should handle valid inputs', () => {
      // TODO: Test with valid input parameters
      expect(true).toBe(true);
    });
  });

  describe('Input Validation', () => {
    it('should validate input parameters', () => {
      // TODO: Test input validation
      expect(true).toBe(true);
    });

    it('should handle edge cases', () => {
      // TODO: Test edge cases and boundary conditions
      expect(true).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', () => {
      // TODO: Test error scenarios
      expect(true).toBe(true);
    });

    it('should provide meaningful error messages', () => {
      // TODO: Test error message content
      expect(true).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should perform efficiently', () => {
      // TODO: Test performance characteristics
      expect(true).toBe(true);
    });
  });
});
`;
}

function generateGenericTest() {
  return `import { jest } from '@jest/globals';
import { ${fileName} } from '../${fileName}';

describe('${fileName}', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Core Functionality', () => {
    it('should work as expected', () => {
      // TODO: Implement test for core functionality
      expect(true).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle edge cases', () => {
      // TODO: Test edge cases
      expect(true).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors properly', () => {
      // TODO: Test error scenarios
      expect(true).toBe(true);
    });
  });
});
`;
}

// Generate and write the test file
const testContent = generateTestContent();

fs.writeFileSync(testFilePath, testContent);

console.log(`✅ Test file generated: ${testFilePath}`);
console.log(`📝 Test type: ${type}`);
console.log(`🎯 Remember to replace placeholder tests with actual test implementations!`);
console.log(`🚀 Run tests with: npm test ${testFilePath}`);