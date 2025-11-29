import { NextResponse } from 'next/server';
import { getAllLessons } from '@/lib/models/lessons';

// Disable caching for real-time updates
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const lessons = await getAllLessons();
        return NextResponse.json(lessons);
    } catch (error) {
        console.error('Error fetching lessons:', error);
        return NextResponse.json({ error: 'Erro ao buscar aulas' }, { status: 500 });
    }
}
