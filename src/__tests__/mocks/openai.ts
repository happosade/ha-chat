// Mock OpenAI client
export const mockOpenAI = {
  chat: {
    completions: {
      create: jest.fn().mockResolvedValue({
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'This is a test response',
            },
            finish_reason: 'stop',
          },
        ],
      }),
    },
  },
};

// Mock OpenAI client with tool calls
export const mockOpenAIWithToolCalls = {
  chat: {
    completions: {
      create: jest.fn().mockResolvedValue({
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'I need to use a tool',
              tool_calls: [
                {
                  id: 'call_123',
                  type: 'function',
                  function: {
                    name: 'get_weather',
                    arguments: '{"location":"New York"}',
                  },
                },
              ],
            },
            finish_reason: 'tool_calls',
          },
        ],
      }),
    },
  },
};

// Mock for tool call response
export const mockToolCallResponse = {
  call_123: {
    result: 'Sunny and 75°F in New York'
  }
};
