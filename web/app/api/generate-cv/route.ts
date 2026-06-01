import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkAndDeductCredit, logUsage } from '@/lib/credits';
import { chat } from '@/lib/ai/foundry-client.js';
import { buildGenerationPrompt } from '@/lib/ai/prompts/cv-generation.js';
import { MODEL_CV_GENERATION } from '@/lib/ai/ai.config.js';
import { renderCv } from '@/lib/cv-engine.js';

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { cvData, jdText } = await req.json();
  if (!cvData || !jdText) {
    return NextResponse.json({ error: 'cvData and jdText are required' }, { status: 400 });
  }

  const credit = await checkAndDeductCredit(user.id);
  if (!credit.allowed) {
    return NextResponse.json(
      { error: 'out_of_credits', reset_at: credit.reset_at, remaining: 0 },
      { status: 402 },
    );
  }

  try {
    const messages = buildGenerationPrompt(cvData, jdText);
    const raw = await chat(MODEL_CV_GENERATION, messages, { response_format: { type: 'json_object' } });
    const overlayData = JSON.parse(raw);

    const html = renderCv(cvData, overlayData);

    await logUsage(user.id, 'cv_generation', 0);

    return NextResponse.json({
      overlayData,
      html,
      credits_remaining: credit.remaining - 1,
    });
  } catch (err) {
    console.error('generate-cv error:', err);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
