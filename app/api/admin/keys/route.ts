import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import {
    getAllKeys,
    createKey,
    toggleActive,
    deleteKey,
    generateRandomKey
} from '@/lib/models/access-keys';

// GET - List all keys
export async function GET() {
    try {
        await requireAdmin();
        const keys = await getAllKeys();
        return NextResponse.json(keys);
    } catch (error: any) {
        if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }
        console.error('Error fetching keys:', error);
        return NextResponse.json({ error: 'Erro ao buscar chaves' }, { status: 500 });
    }
}

// POST - Create new key
export async function POST(request: NextRequest) {
    try {
        await requireAdmin();
        const body = await request.json();
        const { key, ownerName, random } = body;

        let newKey: string;

        if (random) {
            // Generate random key
            newKey = generateRandomKey();
        } else if (key) {
            // Use provided key
            newKey = key.trim();
        } else {
            return NextResponse.json(
                { error: 'Chave ou flag random é obrigatória' },
                { status: 400 }
            );
        }

        const createdKey = await createKey(newKey, ownerName);
        return NextResponse.json(createdKey, { status: 201 });
    } catch (error: any) {
        if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }
        console.error('Error creating key:', error);
        return NextResponse.json(
            { error: 'Erro ao criar chave. Ela pode já existir.' },
            { status: 500 }
        );
    }
}

// PATCH - Toggle active status
export async function PATCH(request: NextRequest) {
    try {
        await requireAdmin();
        const body = await request.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
        }

        await toggleActive(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }
        console.error('Error toggling key:', error);
        return NextResponse.json({ error: 'Erro ao atualizar chave' }, { status: 500 });
    }
}

// DELETE - Delete key
export async function DELETE(request: NextRequest) {
    try {
        await requireAdmin();
        const body = await request.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
        }

        await deleteKey(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }
        if (error.message.includes('administrador')) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        console.error('Error deleting key:', error);
        return NextResponse.json({ error: 'Erro ao deletar chave' }, { status: 500 });
    }
}
