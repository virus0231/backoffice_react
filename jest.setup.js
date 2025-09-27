import '@testing-library/jest-dom';

// Add Node.js globals for Next.js compatibility
if (!global.TextEncoder) {
  global.TextEncoder = require('util').TextEncoder;
}
if (!global.TextDecoder) {
  global.TextDecoder = require('util').TextDecoder;
}

// Mock NextRequest for API route testing
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((input, init = {}) => ({
    url: input,
    method: init.method || 'GET',
    headers: new Map(Object.entries(init.headers || {})),
    cookies: new Map(),
    nextUrl: {
      searchParams: new URLSearchParams()
    },
    json: jest.fn().mockResolvedValue({}),
    text: jest.fn().mockResolvedValue('')
  })),
  NextResponse: {
    json: jest.fn().mockImplementation((data, init = {}) => ({
      status: init.status || 200,
      json: jest.fn().mockResolvedValue(data),
      headers: new Map(Object.entries(init.headers || {}))
    }))
  }
}));

// Mock Request and Response for Next.js API routes
if (!global.Request) {
  global.Request = class MockRequest {
    constructor(input, init = {}) {
      Object.defineProperty(this, 'url', {
        value: input,
        writable: false,
        configurable: true
      });
      this.method = init.method || 'GET';
      this.headers = new Map(Object.entries(init.headers || {}));
      this.body = init.body;
    }

    async json() {
      return JSON.parse(this.body || '{}');
    }

    async text() {
      return this.body || '';
    }
  };
}

if (!global.Response) {
  global.Response = class MockResponse {
    constructor(body, init = {}) {
      this.body = body;
      this.status = init.status || 200;
      this.statusText = init.statusText || 'OK';
      this.headers = new Map(Object.entries(init.headers || {}));
    }

    static json(data, init = {}) {
      return new MockResponse(JSON.stringify(data), {
        ...init,
        headers: { 'Content-Type': 'application/json', ...init.headers }
      });
    }

    async json() {
      return JSON.parse(this.body);
    }

    async text() {
      return this.body;
    }
  };
}

// Set up environment variables for tests
process.env.DB_HOST = 'localhost';
process.env.DB_NAME = 'test_database';
process.env.DB_USER = 'test_user';
process.env.DB_PASSWORD = 'test_password';
process.env.DB_PORT = '3306';
process.env.NODE_ENV = 'test';

// Mock crypto for Node.js environment
const crypto = require('crypto');
if (!global.crypto) {
  global.crypto = {
    randomUUID: () => crypto.randomUUID(),
  };
}

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  usePathname() {
    return '/dashboard';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />;
  },
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
}));

// Mock window.matchMedia (only in jsdom env)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

// Suppress console errors/warnings during tests unless explicitly testing them
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning') || args[0].includes('React does not recognize'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('componentWillReceiveProps')) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
