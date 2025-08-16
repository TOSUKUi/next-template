import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";
import "whatwg-fetch";

// Polyfills for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Set test environment variables
process.env.NODE_ENV = "test";

// Mock Request and Response for Next.js API Routes
Object.defineProperty(global, "Request", {
  value: class Request {
    constructor(url, options = {}) {
      this.url = url;
      this.method = options.method || "GET";
      this.headers = new Headers(options.headers || {});
      this.body = options.body || null;
    }
  },
});

Object.defineProperty(global, "Response", {
  value: class Response {
    constructor(body, options = {}) {
      this.status = options.status || 200;
      this.statusText = options.statusText || "OK";
      this.headers = new Headers(options.headers || {});
      this._body = body;
    }

    static json(data, options = {}) {
      return new Response(JSON.stringify(data), {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });
    }

    async json() {
      if (this._body === null || this._body === undefined) {
        return null;
      }
      if (typeof this._body === "string") {
        return JSON.parse(this._body);
      }
      return this._body;
    }
  },
});

// Mock NextResponse specifically for Next.js API Routes
const { NextResponse } = jest.requireActual("next/server");
jest.mock("next/server", () => ({
  ...jest.requireActual("next/server"),
  NextResponse: {
    json: (data, options = {}) => {
      const response = new Response(JSON.stringify(data), {
        status: options.status || 200,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
      });
      response._body = JSON.stringify(data);
      return response;
    },
  },
}));

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Prisma
jest.mock("./lib/prisma", () => ({
  __esModule: true,
  default: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $queryRaw: jest.fn(),
  },
}));

// Suppress console errors in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
