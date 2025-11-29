import db from '../db';

export interface SiteConfig {
    id: number;
    config_key: string;
    config_value: string;
    updated_at: string;
}

export async function getConfig(key: string): Promise<string | null> {
    const result = await db.execute({
        sql: 'SELECT config_value FROM site_config WHERE config_key = ?',
        args: [key]
    });
    return result.rows[0] ? (result.rows[0] as any).config_value : null;
}

export async function setConfig(key: string, value: string): Promise<void> {
    const existing = await getConfig(key);

    if (existing !== null) {
        await db.execute({
            sql: 'UPDATE site_config SET config_value = ?, updated_at = CURRENT_TIMESTAMP WHERE config_key = ?',
            args: [value, key]
        });
    } else {
        await db.execute({
            sql: 'INSERT INTO site_config (config_key, config_value) VALUES (?, ?)',
            args: [key, value]
        });
    }
}

export async function getOverlaySettings(): Promise<{ imageUrl: string; durationMs: number }> {
    const imageUrl = await getConfig('overlay_image_url') || '';
    const durationMs = parseInt(await getConfig('overlay_duration_ms') || '1500');

    return { imageUrl, durationMs };
}

export async function setOverlaySettings(imageUrl: string, durationMs: number): Promise<void> {
    await setConfig('overlay_image_url', imageUrl);
    await setConfig('overlay_duration_ms', durationMs.toString());
}
