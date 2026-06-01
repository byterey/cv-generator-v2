import { createClient } from '@/lib/supabase/server';

export interface UserCredits {
  credits_remaining: number;
  credits_used_total: number;
  reset_at: string;
}

export async function getCredits(userId: string): Promise<UserCredits> {
  const supabase = createClient();
  const { data } = await supabase
    .from('user_credits')
    .select('credits_remaining, credits_used_total, reset_at')
    .eq('user_id', userId)
    .single();
  return data ?? { credits_remaining: 5, credits_used_total: 0, reset_at: '' };
}
