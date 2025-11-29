import db from '../db';

export interface AccessKey {
    id: number;
    key: string;
    owner_name: string | null;
    is_admin: boolean;
    is_active: boolean;
    created_at: string;
}

export async function findByKey(key: string): Promise<AccessKey | undefined> {
    // Check environment variable first (Hardcoded Admin)
    if (process.env.ADMIN_KEY && key === process.env.ADMIN_KEY) {
        return {
            id: 0,
            key: process.env.ADMIN_KEY,
            owner_name: 'Administrador (Sistema)',
            is_admin: true,
            is_active: true,
            created_at: new Date().toISOString()
        };
    }

    try {
        const result = await db.execute({
            sql: 'SELECT * FROM access_keys WHERE key = ?',
            args: [key]
        });
        return result.rows[0] as unknown as AccessKey | undefined;
    } catch (error) {
        console.error('Database error in findByKey:', error);
        return undefined;
    }
}

export async function getAllKeys(): Promise<AccessKey[]> {
    const result = await db.execute('SELECT * FROM access_keys ORDER BY created_at DESC');
    return result.rows as unknown as AccessKey[];
}

export async function createKey(key: string, ownerName?: string, isAdmin: boolean = false): Promise<AccessKey> {
    const result = await db.execute({
        sql: `INSERT INTO access_keys (key, owner_name, is_admin, is_active) VALUES (?, ?, ?, 1)`,
        args: [key, ownerName || null, isAdmin ? 1 : 0]
    });

    return {
        id: Number(result.lastInsertRowid),
        key,
        owner_name: ownerName || null,
        is_admin: isAdmin,
        is_active: true,
        created_at: new Date().toISOString()
    };
}

export async function toggleActive(id: number): Promise<void> {
    await db.execute({
        sql: 'UPDATE access_keys SET is_active = NOT is_active WHERE id = ?',
        args: [id]
    });
}

export async function deleteKey(id: number): Promise<void> {
    // Prevent deletion of admin key
    const keyResult = await db.execute({
        sql: 'SELECT * FROM access_keys WHERE id = ?',
        args: [id]
    });
    const key = keyResult.rows[0] as unknown as AccessKey;

    if (key && key.key === 'admin2020') {
        throw new Error('Não é possível deletar a chave do administrador');
    }

    await db.execute({
        sql: 'DELETE FROM access_keys WHERE id = ?',
        args: [id]
    });
}

export function generateRandomKey(): string {
    const length = Math.floor(Math.random() * 7) + 10; // 10-16 characters
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';

    for (let i = 0; i < length; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return key;
}
