import { NextRequest } from 'next/server';
import { GET, DELETE } from '@/app/api/sessions/[id]/route';
import prisma from '@/lib/prisma';
import { expect, jest, describe, it, beforeEach } from '@jest/globals';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    chatMessage: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

describe('Session ID API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET handler', () => {
    it('should return 400 if sessionId is missing', async () => {
      const req = new NextRequest('http://localhost:3000/api/sessions/undefined');
      const params = { params: { id: '' } }; // Use empty string instead of undefined
      
      const response = await GET(req, params);
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBe('Missing session ID');
    });

    it('should return messages for a specific session', async () => {
      const req = new NextRequest('http://localhost:3000/api/sessions/test-session');
      const params = { params: { id: 'test-session' } };
      
      // Mock Prisma response
      const mockMessages = [
        { id: 1, role: 'user', content: 'Hello', createdAt: new Date() },
        { id: 2, role: 'assistant', content: 'Hi there', createdAt: new Date() },
      ];
      
      (prisma.chatMessage.findMany as jest.Mock).mockResolvedValue(mockMessages);
      
      const response = await GET(req, params);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveLength(2);
      expect(data[0].role).toBe('user');
      expect(data[1].role).toBe('assistant');
    });

    it('should handle errors when fetching messages', async () => {
      const req = new NextRequest('http://localhost:3000/api/sessions/test-session');
      const params = { params: { id: 'test-session' } };
      
      // Mock Prisma error
      (prisma.chatMessage.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      const response = await GET(req, params);
      expect(response.status).toBe(500);
      
      const data = await response.json();
      expect(data.error).toBeDefined();
    });
  });

  describe('DELETE handler', () => {
    it('should return 400 if sessionId is missing', async () => {
      const req = new NextRequest('http://localhost:3000/api/sessions/undefined', { method: 'DELETE' });
      const params = { params: { id: '' } }; // Use empty string instead of undefined
      
      const response = await DELETE(req, params);
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBe('Missing session ID');
    });

    it('should delete messages for a specific session', async () => {
      const req = new NextRequest('http://localhost:3000/api/sessions/test-session', { method: 'DELETE' });
      const params = { params: { id: 'test-session' } };
      
      // Mock Prisma response
      (prisma.chatMessage.deleteMany as jest.Mock).mockResolvedValue({ count: 5 });
      
      const response = await DELETE(req, params);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should handle errors when deleting messages', async () => {
      const req = new NextRequest('http://localhost:3000/api/sessions/test-session', { method: 'DELETE' });
      const params = { params: { id: 'test-session' } };
      
      // Mock Prisma error
      (prisma.chatMessage.deleteMany as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      const response = await DELETE(req, params);
      expect(response.status).toBe(500);
      
      const data = await response.json();
      expect(data.error).toBeDefined();
    });
  });
});
