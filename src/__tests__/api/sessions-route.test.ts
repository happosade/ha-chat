import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/sessions/route';
import prisma from '@/lib/prisma';
import { expect, jest, describe, it, beforeEach, afterEach } from '@jest/globals';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    chatMessage: {
      groupBy: jest.fn(),
    },
  },
}));

describe('Sessions API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Date.now for predictable session IDs in tests
    jest.spyOn(Date, 'now').mockImplementation(() => 1620000000000);
    // Mock Math.random for predictable session IDs
    jest.spyOn(Math, 'random').mockImplementation(() => 0.5);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET handler', () => {
    it('should return 400 if configId is missing', async () => {
      const req = new NextRequest('http://localhost:3000/api/sessions');
      
      const response = await GET(req);
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBe('Missing configuration ID');
    });

    it('should return session list for a given configId', async () => {
      const req = new NextRequest('http://localhost:3000/api/sessions?configId=1');
      
      // Mock Prisma response
      const mockSessions = [
        { sessionId: 'session_1', _count: { _all: 5 } },
        { sessionId: 'session_2', _count: { _all: 3 } },
      ];
      
      (prisma.chatMessage.groupBy as jest.Mock).mockResolvedValue(mockSessions);
      
      const response = await GET(req);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveLength(2);
      expect(data[0].id).toBe('session_1');
      expect(data[0].messages).toBe(5);
    });

    it('should handle database errors', async () => {
      const req = new NextRequest('http://localhost:3000/api/sessions?configId=1');
      
      // Mock database error
      (prisma.chatMessage.groupBy as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      const response = await GET(req);
      expect(response.status).toBe(500);
      
      const data = await response.json();
      expect(data.error).toBeDefined();
    });
  });

  describe('POST handler', () => {
    it('should create a new session ID', async () => {
      const req = new NextRequest('http://localhost:3000/api/sessions', {
        method: 'POST',
        body: JSON.stringify({ configId: '1' }),
      });
      
      const response = await POST(req);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.sessionId).toBe('session_1620000000000_5');
    });

    it('should return 400 if configId is missing', async () => {
      const req = new NextRequest('http://localhost:3000/api/sessions', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      
      const response = await POST(req);
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBe('Missing configuration ID');
    });
  });
});
