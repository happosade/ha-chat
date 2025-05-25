import { NextRequest } from 'next/server';
import { POST } from '@/app/api/chat/route';
import prisma from '@/lib/prisma';
import { OpenAI } from 'openai';
import { mockOpenAI, mockOpenAIWithToolCalls, mockToolCallResponse } from '../mocks/openai';
import { expect, jest, describe, it, beforeEach } from '@jest/globals';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    config: {
      findUnique: jest.fn(),
    },
    tool: {
      findMany: jest.fn(),
    },
    chatMessage: {
      create: jest.fn(),
    },
  },
}));

jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn(),
  };
});

// Mock fetch for MCP tool calls
global.fetch = jest.fn().mockImplementation(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockToolCallResponse),
  })
);

describe('Chat API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if required fields are missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.error).toBe('Invalid request format');
  });

  it('should return 404 if configuration is not found', async () => {
    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
        configId: 1,
      }),
    });

    // Mock configuration not found
    (prisma.config.findUnique as jest.Mock).mockResolvedValue(null);

    const response = await POST(req);
    expect(response.status).toBe(404);
    
    const data = await response.json();
    expect(data.error).toBe('Configuration not found');
  });

  it('should successfully process a chat request without tools', async () => {
    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
        configId: 1,
        sessionId: 'test-session',
      }),
    });

    // Mock configuration
    (prisma.config.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      apiKey: 'test-key',
      llmEndpoint: 'https://api.example.com',
      llmModel: 'gpt-3.5-turbo',
      systemPrompt: 'You are a helpful assistant',
      mcpSupport: false,
    });

    // Mock OpenAI instance
    (OpenAI as unknown as jest.Mock).mockImplementation(() => mockOpenAI);

    const response = await POST(req);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.message.role).toBe('assistant');
    expect(data.message.content).toBe('This is a test response');

    // Verify prisma calls
    expect(prisma.chatMessage.create).toHaveBeenCalledTimes(1);
    expect(prisma.chatMessage.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        role: 'assistant',
        content: 'This is a test response',
        session_id: 'test-session',
      }),
    });

    // Verify OpenAI calls
    expect(OpenAI).toHaveBeenCalledWith({
      apiKey: 'test-key',
      baseURL: 'https://api.example.com',
    });
    expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
      messages: [
        { role: 'system', content: 'You are a helpful assistant' },
        { role: 'user', content: 'Hello' },
      ],
      model: 'gpt-3.5-turbo',
      tools: undefined,
      tool_choice: undefined,
    });
  });

  it('should process a chat request with MCP tools', async () => {
    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'What is the weather?' }],
        configId: 1,
        toolIds: [1],
        sessionId: 'test-session',
      }),
    });

    // Mock configuration with MCP support
    (prisma.config.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      apiKey: 'test-key',
      llmEndpoint: 'https://api.example.com',
      llmModel: 'gpt-4',
      systemPrompt: 'You are a helpful assistant',
      mcpSupport: true,
      mcpEndpoint: 'https://mcp.example.com',
    });

    // Mock tools
    (prisma.tool.findMany as jest.Mock).mockResolvedValue([
      {
        id: 1,
        name: 'get_weather',
        description: 'Get weather information',
        parameters: JSON.stringify({
          type: 'object',
          properties: {
            location: {
              type: 'string',
              description: 'City name',
            },
          },
          required: ['location'],
        }),
      },
    ]);

    // Mock OpenAI with tool calls
    (OpenAI as unknown as jest.Mock).mockImplementation(() => mockOpenAIWithToolCalls);

    const response = await POST(req);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.message.role).toBe('assistant');
    expect(data.message.content).toBe('I need to use a tool');
    expect(JSON.parse(data.message.toolCalls)).toEqual([
      {
        id: 'call_123',
        type: 'function',
        function: {
          name: 'get_weather',
          arguments: '{"location":"New York"}',
        },
        result: 'Sunny and 75°F in New York',
      },
    ]);

    // Verify fetch was called with correct MCP endpoint
    expect(global.fetch).toHaveBeenCalledWith(
      'https://mcp.example.com',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.any(String),
      })
    );

    // Verify prisma calls
    expect(prisma.chatMessage.create).toHaveBeenCalledTimes(1);
    expect(prisma.chatMessage.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        role: 'assistant',
        content: 'I need to use a tool',
        toolCalls: expect.any(String),
        session_id: 'test-session',
      }),
    });
  });

  it('should handle errors from OpenAI API', async () => {
    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
        configId: 1,
      }),
    });

    // Mock configuration
    (prisma.config.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      apiKey: 'test-key',
      llmEndpoint: 'https://api.example.com',
      llmModel: 'gpt-3.5-turbo',
      systemPrompt: null,
      mcpSupport: false,
    });

    // Mock OpenAI API error
    const mockOpenAIWithError = {
      chat: {
        completions: {
          create: jest.fn().mockRejectedValue(new Error('API Error')),
        },
      },
    };
    (OpenAI as unknown as jest.Mock).mockImplementation(() => mockOpenAIWithError);

    const response = await POST(req);
    expect(response.status).toBe(500);
    
    const data = await response.json();
    expect(data.error).toBe('Internal server error');
  });
});
