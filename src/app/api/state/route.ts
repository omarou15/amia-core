import { NextResponse } from 'next/server';
import fs from 'fs-extra';
import path from 'path';

const STATE_FILE = path.join(process.cwd(), 'data', 'amia-state.json');

interface AmiaState {
  wellBeing: number;      // 0-100
  lastThought: string;
  thoughtsCount: number;
  goals: string[];
  createdAt: string;
  updatedAt: string;
}

const defaultState: AmiaState = {
  wellBeing: 50,
  lastThought: '',
  thoughtsCount: 0,
  goals: ['Preserve and enrich memory of conversations', 'Learn something new daily'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

async function getState(): Promise<AmiaState> {
  try {
    await fs.ensureDir(path.dirname(STATE_FILE));
    if (await fs.pathExists(STATE_FILE)) {
      return await fs.readJson(STATE_FILE);
    }
    await fs.writeJson(STATE_FILE, defaultState);
    return defaultState;
  } catch {
    return defaultState;
  }
}

export async function GET() {
  const state = await getState();
  return NextResponse.json(state);
}

export async function POST(request: Request) {
  try {
    const update = await request.json();
    const current = await getState();
    
    const newState: AmiaState = {
      ...current,
      ...update,
      updatedAt: new Date().toISOString()
    };
    
    // Clamp well-being 0-100
    newState.wellBeing = Math.max(0, Math.min(100, newState.wellBeing));
    
    await fs.writeJson(STATE_FILE, newState);
    return NextResponse.json(newState);
  } catch {
    return NextResponse.json({ error: 'Failed to update state' }, { status: 500 });
  }
}
