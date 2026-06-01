import { NextResponse } from 'next/server';
import { deleteCv, updateCv } from '@/lib/supabase/cvs';

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await deleteCv(params.id);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    await updateCv(params.id, body);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
