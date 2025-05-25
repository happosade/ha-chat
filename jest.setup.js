// filepath: /Users/orasila/src/ha-chat/jest.setup.js
require('@testing-library/jest-dom');

// Mock fetch
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

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: jest.fn().mockReturnValue(''),
  useSearchParams: jest.fn().mockReturnValue({
    get: jest.fn(),
    set: jest.fn(),
    toString: jest.fn(),
  }),
}));

// Mock next/headers (for API routes)
jest.mock('next/headers', () => ({
  cookies: jest.fn().mockReturnValue({
    get: jest.fn(),
    getAll: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  }),
  headers: jest.fn().mockReturnValue({
    get: jest.fn(),
    has: jest.fn(),
    entries: jest.fn(),
    values: jest.fn(),
    keys: jest.fn(),
    append: jest.fn(),
    delete: jest.fn(),
    set: jest.fn(),
  }),
}));

// Mock next/server
jest.mock('next/server', () => {
  return {
    NextRequest: jest.fn().mockImplementation((input, init) => ({
      url: typeof input === 'string' ? input : input.toString(),
      method: init?.method || 'GET',
      headers: init?.headers || {},
      body: init?.body,
      json: jest.fn().mockResolvedValue(init?.body ? JSON.parse(init.body) : {}),
      nextUrl: new URL(typeof input === 'string' ? input : input.toString()),
      cookies: {
        get: jest.fn(),
        getAll: jest.fn(),
        set: jest.fn(),
        delete: jest.fn(),
        has: jest.fn(),
      },
    })),
    NextResponse: {
      json: jest.fn().mockImplementation((data, init) => ({
        status: init?.status || 200,
        headers: new Headers({
          'content-type': 'application/json',
          ...init?.headers,
        }),
        json: jest.fn().mockResolvedValue(data),
      })),
      redirect: jest.fn().mockImplementation((url) => ({
        status: 302,
        headers: new Headers({ Location: url.toString() }),
      })),
    },
  };
});

// Add window-specific mocks only in a browser-like environment
if (typeof window !== 'undefined') {
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
}
