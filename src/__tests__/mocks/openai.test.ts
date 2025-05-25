import { mockOpenAI, mockOpenAIWithToolCalls, mockToolCallResponse } from './openai';

describe('OpenAI Mocks', () => {
  test('mockOpenAI should provide a standard chat completion response', async () => {
    const response = await mockOpenAI.chat.completions.create({});
    expect(response.choices[0].message.role).toBe('assistant');
    expect(response.choices[0].message.content).toBe('This is a test response');
    expect(response.choices[0].finish_reason).toBe('stop');
  });

  test('mockOpenAIWithToolCalls should provide a response with tool calls', async () => {
    const response = await mockOpenAIWithToolCalls.chat.completions.create({});
    expect(response.choices[0].message.role).toBe('assistant');
    expect(response.choices[0].message.content).toBe('I need to use a tool');
    expect(response.choices[0].message.tool_calls).toBeDefined();
    expect(response.choices[0].message.tool_calls[0].function.name).toBe('get_weather');
    expect(response.choices[0].finish_reason).toBe('tool_calls');
  });

  test('mockToolCallResponse should provide tool call results', () => {
    expect(mockToolCallResponse.call_123.result).toBe('Sunny and 75°F in New York');
  });
});
