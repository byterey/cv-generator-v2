import { createServiceClient } from '@/lib/supabase/server';

export interface CreditCheckResult {
  allowed: boolean;
  remaining: number;
  reset_at: string;
}

/** Ensure credits row exists and reset if month has passed, then check balance. */
export async function checkAndDeductCredit(userId: string): Promise<CreditCheckResult> {
  const supabase = createServiceClient();

  // Ensure row exists + reset if expired
  await supabase.rpc('ensure_user_credits', { p_user_id: userId });

  // Atomic deduct
  const { data: allowed, error } = await supabase.rpc('deduct_credit', { p_user_id: userId });
  if (error) throw error;

  const { data: row } = await supabase
    .from('user_credits')
    .select('credits_remaining, reset_at')
    .eq('user_id', userId)
    .single();

  return {
    allowed: allowed === true,
    remaining: row?.credits_remaining ?? 0,
    reset_at: row?.reset_at ?? '',
  };
}

export async function logUsage(userId: string, action: string, tokensUsed = 0) {
  const supabase = createServiceClient();
  await supabase.from('usage_logs').insert({ user_id: userId, action, tokens_used: tokensUsed });
}
