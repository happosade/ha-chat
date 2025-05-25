/**
 * This file only contains utility functions and should not be run as a test.
 * @jest-environment node
 */

// Define global polyfills and mocks for tests
export function setupGlobals() {
  // Set up the globals for tests
  global.Request = class Request {
    constructor(input, init) {
      this.url = input;
      this.method = init?.method || 'GET';
      this.headers = new Headers(init?.headers);
      this.body = init?.body;
    }
  };

  global.Response = class Response {
    constructor(body, init) {
      this.body = body;
      this.status = init?.status || 200;
      this.statusText = init?.statusText || '';
      this.headers = new Headers(init?.headers);
      this._json = typeof body === 'string' ? JSON.parse(body) : body;
    }
    
    json() {
      return Promise.resolve(this._json);
    }
  };

  global.Headers = class Headers {
    constructor(init) {
      this._headers = {};
      
      if (init) {
        Object.entries(init).forEach(([key, value]) => {
          this.set(key, value);
        });
      }
    }
    
    get(name) {
      return this._headers[name.toLowerCase()];
    }
    
    set(name, value) {
      this._headers[name.toLowerCase()] = value;
    }
    
    has(name) {
      return name.toLowerCase() in this._headers;
    }
  };
}

// Execute the setup if this file is being run directly
setupGlobals();
