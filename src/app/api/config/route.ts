import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Get all configurations
export async function GET() {
  try {
    const configs = await prisma.config.findMany({
      select: {
        id: true,
        name: true,
        llmEndpoint: true,
        llmModel: true,
        mcpSupport: true,
        mcpEndpoint: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(configs);
  } catch (error) {
    console.error('Error fetching configurations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch configurations' },
      { status: 500 }
    );
  }
}

// Create a new configuration
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, llmEndpoint, llmModel, apiKey, mcpSupport, mcpEndpoint } = body;

    // Check if name already exists
    const existingConfig = await prisma.config.findUnique({
      where: { name },
    });

    if (existingConfig) {
      return NextResponse.json(
        { error: 'Configuration name already exists' },
        { status: 400 }
      );
    }

    // Create the new configuration
    const config = await prisma.config.create({
      data: {
        name,
        llmEndpoint,
        llmModel,
        apiKey,
        mcpSupport: mcpSupport || false,
        mcpEndpoint: mcpSupport ? mcpEndpoint : null,
      },
    });

    return NextResponse.json({
      id: config.id,
      name: config.name,
      llmEndpoint: config.llmEndpoint,
      llmModel: config.llmModel,
      mcpSupport: config.mcpSupport,
      mcpEndpoint: config.mcpEndpoint,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    });
  } catch (error) {
    console.error('Error creating configuration:', error);
    return NextResponse.json(
      { error: 'Failed to create configuration' },
      { status: 500 }
    );
  }
}
