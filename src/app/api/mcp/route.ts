import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { toolId, inputs, configId } = body;

    if (!toolId || !inputs || !configId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the tool and config
    const [tool, config] = await Promise.all([
      prisma.tool.findUnique({ where: { id: toolId } }),
      prisma.config.findUnique({ where: { id: configId } }),
    ]);

    if (!tool) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      );
    }

    if (!config) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    if (!config.mcpSupport || !config.mcpEndpoint) {
      return NextResponse.json(
        { error: 'MCP is not enabled for this configuration' },
        { status: 400 }
      );
    }

    // Determine the endpoint to use:
    // 1. If the MCP endpoint is configured and the tool has a relative path, combine them
    // 2. Otherwise use the tool's full endpoint
    const endpointUrl = tool.endpoint.startsWith('/')
      ? `${config.mcpEndpoint}${tool.endpoint}`
      : tool.endpoint;

    // Execute the tool by sending a request to its endpoint
    const response = await axios.post(
      endpointUrl,
      { inputs },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
      }
    );

    return NextResponse.json({
      result: response.data,
    });
  } catch (error) {
    console.error('Error in MCP API:', error);
    return NextResponse.json(
      { error: 'Failed to process tool request' },
      { status: 500 }
    );
  }
}
