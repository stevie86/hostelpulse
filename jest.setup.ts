/* eslint-disable @typescript-eslint/no-explicit-any */
// Optional: configure or set up a testing framework before each test.
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock next-auth globally to prevent ESM parsing issues in auth.ts
jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    auth: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    handlers: {},
  })),
}));

// Mock @/auth globally
jest.mock('@/auth', () => ({
  auth: jest.fn(() =>
    Promise.resolve({ user: { id: 'test-user', email: 'test@example.com' } })
  ),
  signIn: jest.fn(),
  signOut: jest.fn(),
  handlers: {},
}));

// Mock auth-utils globally to bypass RBAC in unit tests
jest.mock('@/lib/auth-utils', () => ({
  verifyPropertyAccess: jest
    .fn()
    .mockResolvedValue({ userId: 'test-user', role: 'admin' }),
}));

if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    url: string;
    method: string;
    headers: Headers;

    constructor(input: any, init?: any) {
      this.url = input;
      this.method = init?.method || 'GET';
      this.headers = new Headers(init?.headers);
    }
  } as any;
}

if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    body: any;
    status: number;
    headers: Headers;

    constructor(body?: any, init?: any) {
      this.body = body;
      this.status = init?.status || 200;
      this.headers = new Headers(init?.headers);
    }
  } as any;
}

if (typeof global.Headers === 'undefined') {
  global.Headers = class Headers {
    map: Map<string, string>;

    constructor(init?: any) {
      this.map = new Map(Object.entries(init || {}));
    }
    append(name: string, value: string) {
      this.map.set(name, value);
    }
    delete(name: string) {
      this.map.delete(name);
    }
    get(name: string) {
      return this.map.get(name) || null;
    }
    has(name: string) {
      return this.map.has(name);
    }
    set(name: string, value: string) {
      this.map.set(name, value);
    }
    forEach(callback: (value: string, key: string) => void) {
      this.map.forEach(callback);
    }
  } as any;
}

// Mock the global File class for Node.js environment in Jest
global.File = class MockFile extends Blob {
  name: string;
  constructor(content: any[], name: string, options?: any) {
    super(content, options);
    this.name = name;
  }

  // Add the text() method for mocking
  async text() {
    return this.arrayBuffer().then((buffer) => Buffer.from(buffer).toString());
  }
} as any;

// Wait for database to be ready
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function waitForDb() {
  let retries = 30; // Increased retries
  while (retries > 0) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('Database ready');
      return;
    } catch (e) {
      console.log(`Database not ready, retries left: ${retries}`);
      retries--;
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
    }
  }
  throw new Error('Database not ready after retries');
}

beforeAll(async () => {
  await waitForDb();
});
