import { NextResponse } from 'next/server';
import { renderCv } from '@/lib/cv-engine.js';

export async function POST(req: Request) {
  try {
    const { cvData, overlayData } = await req.json();
    if (!cvData) return NextResponse.json({ error: 'cvData is required' }, { status: 400 });
    const html = renderCv(cvData, overlayData ?? null);
    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (err) {
    console.error('generate-html error:', err);
    return NextResponse.json({ error: 'HTML generation failed' }, { status: 500 });
  }
}
