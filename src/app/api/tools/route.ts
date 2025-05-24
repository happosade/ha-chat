import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Get all tools
export async function GET() {
  try {
    const tools = await prisma.tool.findMany();
    return NextResponse.json(tools);
  } catch (error) {
    console.error('Error fetching tools:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tools' },
      { status: 500 }
    );
  }
}

// Create a new tool
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, endpoint, parameters } = body;

    if (!name || !description || !endpoint || !parameters) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate parameters is valid JSON
    try {
      JSON.parse(parameters);
    } catch (e) {
      return NextResponse.json(
        { error: 'Parameters must be valid JSON' },
        { status: 400 }
      );
    }

    // Create the new tool
    const tool = await prisma.tool.create({
      data: {
        name,
        description,
        endpoint,
        parameters,
      },
    });

    return NextResponse.json(tool);
  } catch (error) {
    console.error('Error creating tool:', error);
    return NextResponse.json(
      { error: 'Failed to create tool' },
      { status: 500 }
    );
  }
}
