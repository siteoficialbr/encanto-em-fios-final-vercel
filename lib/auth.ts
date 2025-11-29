import { cookies } from 'next/headers';
import { findByKey } from './models/access-keys';

const SESSION_COOKIE_NAME = 'encanto_session';

export interface Session {
    key: string;
    isAdmin: boolean;
}

export async function createSession(key: string, isAdmin: boolean): Promise<void> {
    const sessionData: Session = { key, isAdmin };
    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
    });
}

export async function getSession(): Promise<Session | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie) {
        return null;
    }

    try {
        const session = JSON.parse(sessionCookie.value) as Session;

        // Validate that the key still exists and is active
        const accessKey = await findByKey(session.key);
        if (!accessKey || !accessKey.is_active) {
            await clearSession();
            return null;
        }

        return session;
    } catch {
        return null;
    }
}

export async function clearSession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function requireAuth(): Promise<Session> {
    const session = await getSession();

    if (!session) {
        throw new Error('Unauthorized');
    }

    return session;
}

export async function requireAdmin(): Promise<Session> {
    const session = await requireAuth();

    if (!session.isAdmin) {
        throw new Error('Forbidden');
    }

    return session;
}
