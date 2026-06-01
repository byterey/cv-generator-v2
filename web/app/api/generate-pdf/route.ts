import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { renderCv } from '@/lib/cv-engine.js';

// Allow up to 60s for Puppeteer — default 30s is too tight for cold starts
export const maxDuration = 60;

export async function POST(req: Request) {
  let browser;
  try {
    const { cvData, overlayData } = await req.json();
    if (!cvData) {
      return NextResponse.json({ error: 'cvData is required' }, { status: 400 });
    }

    const html = renderCv(cvData, overlayData ?? null);

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: '18mm', right: '18mm', bottom: '18mm', left: '18mm' },
      printBackground: true,
      tagged: true,
    });

    return new NextResponse(Buffer.from(pdf), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="cv.pdf"',
      },
    });
  } catch (err) {
    console.error('generate-pdf error:', err);
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 });
  } finally {
    await browser?.close();
  }
}
