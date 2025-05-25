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

    // Get all unique session IDs for the config and count their messages
    const messages = await prisma.chatMessage.groupBy({
      by: ['sessionId'],
      where: {
        configId: parseInt(configId),
        sessionId: { not: null },
      },
      _count: {
        _all: true,
      },
      orderBy: {
        _max: {
          createdAt: 'desc',
        },
      },
    });

    const sessions = messages.map(msg => ({
      id: msg.sessionId!,
      messages: msg._count._all,
    }));

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

    // Create a new session ID with timestamp and random string for uniqueness
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const sessionId = `session_${timestamp}_${random}`;

    // No need to create an initial record - the first message will create the session

    return NextResponse.json({ sessionId });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}