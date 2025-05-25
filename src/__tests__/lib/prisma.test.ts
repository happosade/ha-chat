import { expect, jest } from '@jest/globals';
import prisma from '@/lib/prisma';

// Mock the PrismaClient
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      config: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      tool: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      chatMessage: {
        findMany: jest.fn(),
        create: jest.fn(),
        deleteMany: jest.fn(),
        groupBy: jest.fn(),
      },
      $connect: jest.fn(),
      $disconnect: jest.fn(),
    })),
  };
});

describe('Prisma Client', () => {
  it('should be defined', () => {
    expect(prisma).toBeDefined();
  });

  it('should have config model', () => {
    expect(prisma.config).toBeDefined();
    expect(typeof prisma.config.findMany).toBe('function');
    expect(typeof prisma.config.findUnique).toBe('function');
    expect(typeof prisma.config.create).toBe('function');
    expect(typeof prisma.config.update).toBe('function');
    expect(typeof prisma.config.delete).toBe('function');
  });

  it('should have tool model', () => {
    expect(prisma.tool).toBeDefined();
    expect(typeof prisma.tool.findMany).toBe('function');
    expect(typeof prisma.tool.create).toBe('function');
    expect(typeof prisma.tool.update).toBe('function');
    expect(typeof prisma.tool.delete).toBe('function');
  });

  it('should have chatMessage model', () => {
    expect(prisma.chatMessage).toBeDefined();
    expect(typeof prisma.chatMessage.findMany).toBe('function');
    expect(typeof prisma.chatMessage.create).toBe('function');
    expect(typeof prisma.chatMessage.deleteMany).toBe('function');
    expect(typeof prisma.chatMessage.groupBy).toBe('function');
  });
});