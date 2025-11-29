import { NextRequest, NextResponse } from 'next/server';
import { findByKey } from '@/lib/models/access-keys';
import { createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { key } = body;

        if (!key || typeof key !== 'string') {
            return NextResponse.json(
                { error: 'Chave é obrigatória' },
                { status: 400 }
            );
        }

        // Find the access key
        const accessKey = await findByKey(key.trim());

        if (!accessKey) {
            return NextResponse.json(
                { error: 'Chave inválida ou desativada. Verifique com o suporte.' },
                { status: 401 }
            );
        }

        if (!accessKey.is_active) {
            return NextResponse.json(
                { error: 'Chave inválida ou desativada. Verifique com o suporte.' },
                { status: 401 }
            );
        }

        // Create session
        await createSession(accessKey.key, accessKey.is_admin);

        // Return redirect URL based on admin status
        const redirectUrl = accessKey.is_admin ? '/admin' : '/aulas';

        return NextResponse.json({
            success: true,
            redirectUrl,
            isAdmin: accessKey.is_admin
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Erro ao processar login' },
            { status: 500 }
        );
    }
}
