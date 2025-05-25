// Set up the test framework extensions
import '@testing-library/jest-dom';

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
  const NextRequest = jest.fn().mockImplementation((input, init) => ({
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
  }));

  const NextResponse = {
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
  };

  return {
    NextRequest,
    NextResponse,
  };
});
