import { NextResponse } from 'next/server';
import { createCv } from '@/lib/supabase/cvs';

export async function POST(req: Request) {
  try {
    const { name, data } = await req.json();
    const cv = await createCv(name ?? 'My CV', data ?? {});
    return NextResponse.json(cv, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Create failed' }, { status: 500 });
  }
}
