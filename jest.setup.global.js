// Global mocks for Web APIs
// This file sets up globals that need to be available before any tests run

// Mock for fetch
global.fetch = jest.fn().mockImplementation(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);

// Mock for Request
global.Request = jest.fn().mockImplementation((input, init) => ({
  url: typeof input === 'string' ? input : input.toString(),
  method: init?.method || 'GET',
  headers: init?.headers || {},
  body: init?.body,
  json: jest.fn().mockResolvedValue({}),
}));

// Mock for Response
global.Response = jest.fn().mockImplementation((body, init) => ({
  body,
  status: init?.status || 200,
  statusText: init?.statusText || '',
  headers: init?.headers || {},
  json: jest.fn().mockResolvedValue(typeof body === 'string' ? JSON.parse(body) : body || {}),
}));

// Mock for Headers
global.Headers = jest.fn().mockImplementation((init) => {
  const headers = {};
  if (init) {
    Object.entries(init).forEach(([key, value]) => {
      headers[key.toLowerCase()] = value;
    });
  }
  return {
    get: jest.fn(name => headers[name.toLowerCase()]),
    set: jest.fn((name, value) => { headers[name.toLowerCase()] = value; }),
    has: jest.fn(name => name.toLowerCase() in headers),
    append: jest.fn(),
    delete: jest.fn(),
    forEach: jest.fn(),
    _headers: headers,
  };
});

// Mock for URL
if (!global.URL.createObjectURL) {
  global.URL.createObjectURL = jest.fn();
  global.URL.revokeObjectURL = jest.fn();
}

// Mock for matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
