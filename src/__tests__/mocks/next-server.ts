// Mock NextRequest and NextResponse

// Add proper typings
interface ReadableStreamReadResult {
  done: boolean;
  value?: Uint8Array;
}

export class NextRequest extends Request {
  nextUrl: URL;
  cookies: {
    get: jest.Mock;
    getAll: jest.Mock;
    set: jest.Mock;
    delete: jest.Mock;
    has: jest.Mock;
  };

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
  
  json(): Promise<any> {
    return this.text().then(text => text ? JSON.parse(text) : {});
  }

  text(): Promise<string> {
    if (!this.body) return Promise.resolve('');
    
    const reader = this.body.getReader();
    
    return new Promise<string>((resolve) => {
      let result = '';
      
      function processText({ done, value }: ReadableStreamReadResult): void {
        if (done) {
          resolve(result);
          return;
        }
        
        if (value) {
          result += new TextDecoder().decode(value);
        }
        
        reader.read().then(processText);
      }
      
      reader.read().then(processText);
    });
  }
}

export class NextResponse extends Response {
  cookies: {
    get: jest.Mock;
    getAll: jest.Mock;
    set: jest.Mock;
    delete: jest.Mock;
  };

  constructor(body?: BodyInit | null, init?: ResponseInit) {
    super(body, init);
    this.cookies = {
      get: jest.fn(),
      getAll: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    };
  }

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

// Add global fetch if not available
if (typeof global.fetch !== 'function') {
  global.fetch = jest.fn().mockImplementation(() => 
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    })
  );
}
