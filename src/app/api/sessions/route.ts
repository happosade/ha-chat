import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Get all sessions for a configuration
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const configId = url.searchParams.get('configId');
    
    if (!configId) {
      return NextResponse.json(
        { error: 'Missing configuration ID' },
        { status: 400 }
      );
    }

    // Get all unique session IDs for the config, with count of messages
    const sessions = await prisma.$queryRaw`
      SELECT sessionId as id, COUNT(*) as messages
      FROM ChatMessage
      WHERE configId = ${parseInt(configId)}
      AND sessionId IS NOT NULL
      GROUP BY sessionId
      ORDER BY MAX(createdAt) DESC
    `;

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

// Create a new session
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { configId } = body;

    if (!configId) {
      return NextResponse.json(
        { error: 'Missing configuration ID' },
        { status: 400 }
      );
    }

    // Generate a unique session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({ sessionId });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
