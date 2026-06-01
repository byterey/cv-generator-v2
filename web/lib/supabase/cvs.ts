import { createClient } from '@/lib/supabase/server';

export interface CvRow {
  id: string;
  name: string;
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export async function listCvs(): Promise<CvRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('cvs')
    .select('id, name, created_at, updated_at')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as CvRow[];
}

export async function getCv(id: string): Promise<CvRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('cvs')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return data as CvRow;
}

export async function createCv(name: string, cvData: Record<string, unknown>): Promise<CvRow> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('cvs')
    .insert({ name, data: cvData, user_id: user!.id })
    .select()
    .single();
  if (error) throw error;
  return data as CvRow;
}

export async function updateCv(id: string, updates: Partial<Pick<CvRow, 'name' | 'data'>>): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('cvs').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteCv(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('cvs').delete().eq('id', id);
  if (error) throw error;
}
