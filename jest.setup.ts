// Optional: configure or set up a testing framework before each test.
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.TextDecoder = TextDecoder as any;

if (typeof global.Request === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.Request = class Request {
        url: string;
        method: string;
        headers: Headers;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        constructor(input: any, init?: any) {
            this.url = input;
            this.method = init?.method || 'GET';
            this.headers = new Headers(init?.headers);
        }
    } as any;
}

if (typeof global.Response === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.Response = class Response {
        body: any;
        status: number;
        headers: Headers;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        constructor(body?: any, init?: any) {
            this.body = body;
            this.status = init?.status || 200;
            this.headers = new Headers(init?.headers);
        }
    } as any;
}

if (typeof global.Headers === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.Headers = class Headers {
        map: Map<string, string>;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        constructor(init?: any) {
            this.map = new Map(Object.entries(init || {}));
        }
        append(name: string, value: string) { this.map.set(name, value); }
        delete(name: string) { this.map.delete(name); }
        get(name: string) { return this.map.get(name) || null; }
        has(name: string) { return this.map.has(name); }
        set(name: string, value: string) { this.map.set(name, value); }
        forEach(callback: (value: string, key: string) => void) {
            this.map.forEach(callback);
        }
    } as any;
}

// Mock the global File class for Node.js environment in Jest
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.File = class MockFile extends Blob {
    name: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(content: any[], name: string, options?: any) {
      super(content, options);
      this.name = name;
    }
  
    // Add the text() method for mocking
    async text() {
      return this.arrayBuffer().then(buffer => Buffer.from(buffer).toString());
    }
} as any;