import 'dotenv/config';
import { createClient } from '@libsql/client';

const client = createClient({
    url: process.env.TURSO_DATABASE_URL || process.env.TURSO_DB_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function setup() {
    try {
        console.log('🚀 Starting Robust Database Setup...');

        // 1. Create access_keys table
        console.log('Checking access_keys table...');
        await client.execute(`
            CREATE TABLE IF NOT EXISTS access_keys (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT UNIQUE NOT NULL,
                owner_name TEXT,
                is_admin BOOLEAN DEFAULT 0,
                is_active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 2. Create lessons table
        console.log('Checking lessons table...');
        await client.execute(`
            CREATE TABLE IF NOT EXISTS lessons (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                video_id TEXT NOT NULL,
                description TEXT,
                materials TEXT,
                steps TEXT,
                cover_image TEXT,
                seal_difficulty TEXT,
                seal_time_value TEXT,
                seal_time_color TEXT,
                points INTEGER DEFAULT 10,
                min_watch_time INTEGER DEFAULT 10,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 3. Create site_config table
        console.log('Checking site_config table...');
        await client.execute(`
            CREATE TABLE IF NOT EXISTS site_config (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )
        `);

        // 4. Create user_progress table
        console.log('Checking user_progress table...');
        await client.execute(`
            CREATE TABLE IF NOT EXISTS user_progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_key TEXT NOT NULL,
                lesson_id INTEGER NOT NULL,
                completed BOOLEAN DEFAULT 0,
                favorited BOOLEAN DEFAULT 0,
                notes TEXT,
                watch_time_seconds INTEGER DEFAULT 0,
                points_earned INTEGER DEFAULT 0,
                last_viewed DATETIME,
                completed_at DATETIME,
                UNIQUE(user_key, lesson_id)
            )
        `);

        // 5. Ensure Admin Key exists in DB (optional, but good for listing)
        console.log('Ensuring admin key exists in DB...');
        if (process.env.ADMIN_KEY) {
            await client.execute({
                sql: `INSERT OR IGNORE INTO access_keys (key, owner_name, is_admin, is_active) VALUES (?, 'Admin System', 1, 1)`,
                args: [process.env.ADMIN_KEY]
            });
        }

        // 6. Seed Config
        console.log('Seeding config...');
        await client.execute(`INSERT OR IGNORE INTO site_config (key, value) VALUES ('overlay_image_url', '')`);
        await client.execute(`INSERT OR IGNORE INTO site_config (key, value) VALUES ('overlay_duration_ms', '1500')`);

        // 7. Handle Migrations (Add columns if missing)
        console.log('Checking for missing columns...');

        // Helper to check and add column
        const addColumn = async (table: string, column: string, type: string) => {
            try {
                await client.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
                console.log(`✅ Added column ${column} to ${table}`);
            } catch (e: any) {
                if (e.message.includes('duplicate column name')) {
                    console.log(`ℹ️ Column ${column} already exists in ${table}`);
                } else {
                    console.log(`⚠️ Could not add column ${column} to ${table}: ${e.message}`);
                }
            }
        };

        await addColumn('lessons', 'points', 'INTEGER DEFAULT 10');
        await addColumn('lessons', 'min_watch_time', 'INTEGER DEFAULT 10');
        await addColumn('lessons', 'cover_image', 'TEXT');
        await addColumn('lessons', 'seal_difficulty', 'TEXT');
        await addColumn('lessons', 'seal_time_value', 'TEXT');
        await addColumn('lessons', 'seal_time_color', 'TEXT');

        console.log('✅ Database Setup Completed Successfully!');

    } catch (error) {
        console.error('❌ Setup failed:', error);
        process.exit(1);
    }
}

setup();
