import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { setOverlaySettings } from '@/lib/models/site-config';

export async function POST(request: NextRequest) {
    try {
        await requireAdmin();
        const body = await request.json();
        const { imageUrl, durationMs } = body;

        if (durationMs === undefined || durationMs < 0) {
            return NextResponse.json(
                { error: 'Duração inválida' },
                { status: 400 }
            );
        }

        await setOverlaySettings(imageUrl || '', parseInt(durationMs));
        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }
        console.error('Error updating overlay settings:', error);
        return NextResponse.json({ error: 'Erro ao atualizar configurações' }, { status: 500 });
    }
}
