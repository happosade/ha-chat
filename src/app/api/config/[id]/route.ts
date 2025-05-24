import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid configuration ID' },
        { status: 400 }
      );
    }

    const config = await prisma.config.findUnique({
      where: { id },
    });

    if (!config) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

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
    console.error('Error fetching configuration:', error);
    return NextResponse.json(
      { error: 'Failed to fetch configuration' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const body = await req.json();
    const { name, llmEndpoint, llmModel, apiKey, mcpSupport, mcpEndpoint } = body;
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid configuration ID' },
        { status: 400 }
      );
    }

    // Check if the configuration exists
    const existingConfig = await prisma.config.findUnique({
      where: { id },
    });

    if (!existingConfig) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    // Check if name already exists (if changing the name)
    if (name !== existingConfig.name) {
      const nameExists = await prisma.config.findUnique({
        where: { name },
      });

      if (nameExists) {
        return NextResponse.json(
          { error: 'Configuration name already exists' },
          { status: 400 }
        );
      }
    }

    // Update the configuration
    const updatedConfig = await prisma.config.update({
      where: { id },
      data: {
        name,
        llmEndpoint,
        llmModel,
        ...(apiKey && { apiKey }), // Only update API key if provided
        mcpSupport: mcpSupport || false,
        mcpEndpoint: mcpSupport ? mcpEndpoint : null,
      },
    });

    return NextResponse.json({
      id: updatedConfig.id,
      name: updatedConfig.name,
      llmEndpoint: updatedConfig.llmEndpoint,
      llmModel: updatedConfig.llmModel,
      mcpSupport: updatedConfig.mcpSupport,
      mcpEndpoint: updatedConfig.mcpEndpoint,
      createdAt: updatedConfig.createdAt,
      updatedAt: updatedConfig.updatedAt,
    });
  } catch (error) {
    console.error('Error updating configuration:', error);
    return NextResponse.json(
      { error: 'Failed to update configuration' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid configuration ID' },
        { status: 400 }
      );
    }

    // Check if the configuration exists
    const existingConfig = await prisma.config.findUnique({
      where: { id },
    });

    if (!existingConfig) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    // Delete the configuration
    await prisma.config.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting configuration:', error);
    return NextResponse.json(
      { error: 'Failed to delete configuration' },
      { status: 500 }
    );
  }
}
