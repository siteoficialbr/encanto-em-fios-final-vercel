import { NextResponse } from 'next/server';
import { getOverlaySettings } from '@/lib/models/site-config';

export async function GET() {
    try {
        const settings = await getOverlaySettings();
        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching overlay settings:', error);
        return NextResponse.json({ imageUrl: '', durationMs: 1500 }, { status: 500 });
    }
}
