/* eslint-disable @typescript-eslint/no-explicit-any */
// Optional: configure or set up a testing framework before each test.
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

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
global.File = class MockFile extends Blob {
    name: string;
    constructor(content: any[], name: string, options?: any) {
      super(content, options);
      this.name = name;
    }
  
    // Add the text() method for mocking
    async text() {
      return this.arrayBuffer().then(buffer => Buffer.from(buffer).toString());
    }
} as any;
