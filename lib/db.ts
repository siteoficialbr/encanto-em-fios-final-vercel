import { createClient } from '@libsql/client';

// Initialize Turso client
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || process.env.TURSO_DB_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// Initialize database schema
export async function initializeDatabase() {
  // Create access_keys table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS access_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      owner_name TEXT,
      is_admin BOOLEAN NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create lessons table with new fields
  await db.execute(`
    CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      video_id TEXT NOT NULL,
      cover_image TEXT,
      seal_difficulty TEXT,
      seal_time_value TEXT,
      seal_time_color TEXT,
      description TEXT,
      materials TEXT,
      steps TEXT,
      order_num INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Check if we need to add missing columns
  const tableInfo = await db.execute("PRAGMA table_info(lessons)");
  const currentColumns = tableInfo.rows.map((row: any) => row.name);

  // Add missing columns if they don't exist
  if (!currentColumns.includes('cover_image')) {
    console.log('Adding missing column: cover_image');
    await db.execute('ALTER TABLE lessons ADD COLUMN cover_image TEXT');
  }

  if (!currentColumns.includes('seal_difficulty')) {
    console.log('Adding missing column: seal_difficulty');
    await db.execute('ALTER TABLE lessons ADD COLUMN seal_difficulty TEXT');
  }

  if (!currentColumns.includes('seal_time_value')) {
    console.log('Adding missing column: seal_time_value');
    await db.execute('ALTER TABLE lessons ADD COLUMN seal_time_value TEXT');
  }

  if (!currentColumns.includes('seal_time_color')) {
    console.log('Adding missing column: seal_time_color');
    await db.execute('ALTER TABLE lessons ADD COLUMN seal_time_color TEXT');
  }

  // Add gamification fields
  if (!currentColumns.includes('points')) {
    console.log('Adding missing column: points');
    await db.execute('ALTER TABLE lessons ADD COLUMN points INTEGER DEFAULT 10');
  }

  if (!currentColumns.includes('min_watch_time')) {
    console.log('Adding missing column: min_watch_time');
    await db.execute('ALTER TABLE lessons ADD COLUMN min_watch_time INTEGER DEFAULT 10');
  }

  // Create site config table for global settings (overlay, etc.)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS site_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      config_key TEXT UNIQUE NOT NULL,
      config_value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed default overlay settings
  const overlayUrl = await db.execute({
    sql: 'SELECT * FROM site_config WHERE config_key = ?',
    args: ['overlay_image_url']
  });
  if (overlayUrl.rows.length === 0) {
    await db.execute({
      sql: 'INSERT INTO site_config (config_key, config_value) VALUES (?, ?)',
      args: ['overlay_image_url', '']
    });
    await db.execute({
      sql: 'INSERT INTO site_config (config_key, config_value) VALUES (?, ?)',
      args: ['overlay_duration_ms', '1500']
    });
  }

  // Create user_progress table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS user_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_key TEXT NOT NULL,
      lesson_id INTEGER NOT NULL,
      completed BOOLEAN DEFAULT 0,
      favorited BOOLEAN DEFAULT 0,
      notes TEXT,
      watch_time_seconds INTEGER DEFAULT 0,
      points_earned INTEGER DEFAULT 0,
      last_viewed DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      UNIQUE(user_key, lesson_id)
    )
  `);

  // Seed admin key if it doesn't exist (new admin key: admin2020)
  const adminKey = await db.execute({
    sql: 'SELECT * FROM access_keys WHERE key = ?',
    args: ['admin2020']
  });

  if (adminKey.rows.length === 0) {
    // Check if old admin key exists and remove it
    const oldAdminKey = await db.execute({
      sql: 'SELECT * FROM access_keys WHERE key = ?',
      args: ['adminadmin123123']
    });

    if (oldAdminKey.rows.length > 0) {
      await db.execute({
        sql: 'DELETE FROM access_keys WHERE key = ?',
        args: ['adminadmin123123']
      });
    }

    await db.execute({
      sql: 'INSERT INTO access_keys (key, owner_name, is_admin, is_active) VALUES (?, ?, ?, ?)',
      args: ['admin2020', 'Administrador', 1, 1]
    });
  }

  // Seed initial lessons if they don't exist
  const lessonsCount = await db.execute('SELECT COUNT(*) as count FROM lessons');
  const count = lessonsCount.rows[0].count as number;

  if (count === 0) {
    // Lesson 1 - Using a crochet tutorial video
    await db.execute({
      sql: `INSERT INTO lessons (title, video_id, cover_image, seal_difficulty, seal_time_value, seal_time_color, description, materials, steps, order_num)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        'Aula 1 – Início do Crochê',
        'nkRg5Xsnxis',
        'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800',
        'Fácil',
        '1 Hora',
        '#51CF66',
        'Nesta primeira aula, você aprenderá os fundamentos do crochê. Vamos começar com os pontos básicos e como segurar a agulha corretamente. Esta é a base para todas as suas futuras criações em crochê.',
        'Agulha de crochê número 4.0 mm, Novelo de linha de algodão (cor de sua preferência), Tesoura',
        'Passo 1: Segure a agulha confortavelmente em sua mão dominante.\nPasso 2: Faça o nó inicial deixando uma ponta de aproximadamente 10 cm.\nPasso 3: Pratique o ponto corrente fazendo uma sequência de 20 pontos.\nPasso 4: Observe no vídeo a posição correta das mãos.',
        1
      ]
    });

    // Lesson 2
    await db.execute({
      sql: `INSERT INTO lessons (title, video_id, cover_image, seal_difficulty, seal_time_value, seal_time_color, description, materials, steps, order_num)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        'Aula 2 – Praticando os Pontos',
        'Vxh_ZGPfLHQ',
        'https://images.unsplash.com/photo-1611652022419-a9419f74343a?w=800',
        'Médio',
        '2 Horas',
        '#4ECDC4',
        'Agora que você já conhece os pontos básicos, vamos praticar! Nesta aula, você criará suas primeiras carreiras e aprenderá a manter a tensão uniforme do fio. A prática constante é essencial para aperfeiçoar sua técnica.',
        'Agulha de crochê número 4.0 mm, Dois novelos de linha de algodão (cores contrastantes), Tesoura, Marcador de pontos',
        'Passo 1: Faça uma base de 30 pontos corrente.\nPasso 2: Retorne fazendo pontos baixos em toda a extensão.\nPasso 3: Faça 10 carreiras mantendo a mesma técnica.\nPasso 4: Observe a tensão do fio - não deve estar muito apertado ou muito solto.',
        2
      ]
    });

    // Lesson 3
    await db.execute({
      sql: `INSERT INTO lessons (title, video_id, cover_image, seal_difficulty, seal_time_value, seal_time_color, description, materials, steps, order_num)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        'Aula 3 – Projeto Especial',
        '0fOqf4Vqw0c',
        'https://images.unsplash.com/photo-1608023136037-626dad6c6188?w=800',
        'Difícil',
        '3 Horas',
        '#FF6B6B',
        'Chegou a hora de colocar em prática tudo que você aprendeu! Vamos criar juntos um lindo projeto em crochê. Siga o passo a passo com calma e atenção, e você terá uma peça maravilhosa para usar ou presentear.',
        'Agulha de crochê número 4.0 mm, Três novelos de linha de algodão (nas cores: branco, rosa e verde), Tesoura, Agulha de tapeçaria para acabamento, Marcador de pontos',
        'Passo 1: Comece com um anel mágico de 6 pontos.\nPasso 2: Aumente seguindo o padrão mostrado no vídeo.\nPasso 3: Continue por 12 carreiras mantendo o padrão.\nPasso 4: Faça o acabamento costurando as pontas com a agulha de tapeçaria.\nPasso 5: Admire sua criação finalizada!',
        3
      ]
    });
  }
}

// Initialize on import
initializeDatabase().catch(console.error);

export default db;
