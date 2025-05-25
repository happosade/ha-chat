// Set up Jest with proper mocking for Next.js
import '@testing-library/jest-dom';

// Add global expect extensions for Jest
import { expect } from '@jest/globals';

// Import our globals setup
import './setup-globals';

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
  class NextRequest extends Request {
    constructor(input: string | Request | URL, init?: RequestInit) {
      super(input, init);
      this.nextUrl = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
      this.cookies = {
        get: jest.fn().mockReturnValue(null),
        getAll: jest.fn().mockReturnValue([]),
        set: jest.fn(),
        delete: jest.fn(),
        has: jest.fn().mockReturnValue(false),
      };
    }
    readonly nextUrl: URL;
    readonly cookies: any;
  }

  class NextResponse extends Response {
    constructor(body?: BodyInit | null, init?: ResponseInit) {
      super(body, init);
      this.cookies = {
        get: jest.fn(),
        getAll: jest.fn(),
        set: jest.fn(),
        delete: jest.fn(),
      };
    }
    readonly cookies: any;

    static json(data: any, init?: ResponseInit): NextResponse {
      return new NextResponse(
        JSON.stringify(data),
        {
          ...init,
          headers: {
            ...init?.headers,
            'content-type': 'application/json',
          },
        }
      );
    }

    static redirect(url: string | URL, init?: ResponseInit): NextResponse {
      return new NextResponse(null, {
        ...init,
        status: 302,
        headers: {
          ...init?.headers,
          Location: url.toString(),
        },
      });
    }
  }

  return {
    NextRequest,
    NextResponse,
  };
});

// Define matchMedia mock
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

// Mock for window.URL
global.URL.createObjectURL = jest.fn();
global.URL.revokeObjectURL = jest.fn();
