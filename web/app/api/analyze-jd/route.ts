import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkAndDeductCredit, logUsage } from '@/lib/credits';
import { chat } from '@/lib/ai/foundry-client.js';
import { buildScreeningPrompt } from '@/lib/ai/prompts/jd-screening.js';
import { MODEL_JD_SCREENING } from '@/lib/ai/ai.config.js';

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
    const messages = buildScreeningPrompt(cvData, jdText);
    const raw = await chat(MODEL_JD_SCREENING, messages, { response_format: { type: 'json_object' } });
    const report = JSON.parse(raw);

    await logUsage(user.id, 'jd_screening', 0);

    return NextResponse.json({ ...report, credits_remaining: credit.remaining - 1 });
  } catch (err) {
    console.error('analyze-jd error:', err);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
