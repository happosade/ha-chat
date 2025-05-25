import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

import prisma from '@/lib/prisma';

interface Tool {
  id: number;
  name: string;
  description: string;
  endpoint: string;
  parameters: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, configId, toolIds = [], sessionId } = body;

    if (!messages || !Array.isArray(messages) || !configId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the config
    const config = await prisma.config.findUnique({
      where: { id: configId },
    });

    if (!config) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    // If MCP tools are enabled, fetch the tools
    let tools: Tool[] = [];
    if (config.mcpSupport && toolIds.length > 0) {
      tools = await prisma.tool.findMany({
        where: { id: { in: toolIds } },
      });
    }

    // Create OpenAI client with the configuration
    const openai = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.llmEndpoint,
    });

    // Prepare the completion request
    const completionRequest: any = {
      model: config.llmModel,
      messages,
    };

    // Add tools if available
    if (tools && tools.length > 0) {
      completionRequest.tools = tools.map(tool => ({
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: JSON.parse(tool.parameters),
        }
      }));
    }

    // Call the LLM API
    const completion = await openai.chat.completions.create(completionRequest);
    
    // Get the assistant's response
    const response = completion.choices[0].message;
    
    // Handle tool calls if present
    if (response.tool_calls && response.tool_calls.length > 0 && config.mcpSupport) {
      // Process each tool call
      const toolCallResults = await Promise.all(
        response.tool_calls.map(async (toolCall) => {
          try {
            // Find the tool by name
            const tool = tools?.find(t => t.name === toolCall.function.name);
            
            if (!tool) {
              return {
                id: toolCall.id,
                error: `Tool "${toolCall.function.name}" not found or not enabled for this chat session`
              };
            }
            
            // Parse the function arguments
            const args = JSON.parse(toolCall.function.arguments);
            
            // Determine the endpoint to use
            const endpointUrl = tool.endpoint.startsWith('/')
              ? `${config.mcpEndpoint}${tool.endpoint}`
              : tool.endpoint;
            
            console.log(`Calling MCP tool ${tool.name} at ${endpointUrl} with args:`, args);
            
            // Call the MCP endpoint with the tool and arguments
            const mcpResponse = await fetch('/api/mcp', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                toolId: tool.id,
                inputs: args,
                configId,
              }),
            });
            
            if (!mcpResponse.ok) {
              const errorData = await mcpResponse.json();
              return {
                id: toolCall.id,
                error: errorData.error || 'Tool execution failed'
              };
            }
            
            const result = await mcpResponse.json();
            return {
              id: toolCall.id,
              result: result.result
            };
          } catch (error) {
            console.error(`Error executing tool ${toolCall.function.name}:`, error);
            return {
              id: toolCall.id,
              error: 'Tool execution failed'
            };
          }
        })
      );
      
      // Add the tool call results to the response content
      const toolCallsContent = toolCallResults.map(result => {
        const toolName = tools?.find(t => t.name === response.tool_calls?.find(tc => tc.id === result.id)?.function?.name)?.name || 'Unknown';
        
        if ('error' in result) {
          return `🛑 **${toolName}:** Tool execution failed - ${result.error}`;
        } else {
          let resultStr = '';
          try {
            // Try to format the result nicely if it's JSON
            const parsedResult = typeof result.result === 'string' 
              ? JSON.parse(result.result) 
              : result.result;
            resultStr = JSON.stringify(parsedResult, null, 2);
          } catch (e) {
            // If not JSON, use as is
            resultStr = String(result.result);
          }
          
          return `✅ **${toolName} Result:**\n\`\`\`json\n${resultStr}\n\`\`\``;
        }
      }).join('\n\n');
      
      // Update the response content with tool results
      response.content = (response.content || '') + 
        (response.content ? '\n\n' : '') + 
        '## Tool Results\n\n' + toolCallsContent;
    }
    
    // Save the user's message to the database first
    const userMessage = messages[messages.length - 1];
    try {
      await prisma.chatMessage.create({
        data: {
          role: userMessage.role,
          content: userMessage.content,
          configId,
          sessionId,
        },
      });
    } catch (error) {
      console.error('Error saving user message:', error);
      // Continue even if saving fails
    }
    
    // Save the assistant's message to the database
    let savedMessage;
    try {
      savedMessage = await prisma.chatMessage.create({
        data: {
          role: 'assistant',
          content: response.content || '',
          configId,
          toolCalls: response.tool_calls ? JSON.stringify(response.tool_calls) : null,
          sessionId,
        },
      });
    } catch (error) {
      console.error('Error saving assistant message:', error);
      // Return the message even if we can't save it
      return NextResponse.json({
        message: {
          id: Date.now(),
          role: 'assistant',
          content: response.content || '',
          toolCalls: response.tool_calls ? JSON.stringify(response.tool_calls) : null,
        }
      });
    }

    return NextResponse.json({
      message: {
        id: savedMessage.id,
        role: savedMessage.role,
        content: savedMessage.content,
        toolCalls: savedMessage.toolCalls,
      }
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
