import db from '../db';

export interface UserProgress {
    id: number;
    user_key: string;
    lesson_id: number;
    completed: boolean;
    favorited: boolean;
    notes: string | null;
    watch_time_seconds: number;
    points_earned: number;
    last_viewed: string;
    completed_at: string | null;
}

export async function getProgress(userKey: string, lessonId: number): Promise<UserProgress | undefined> {
    const result = await db.execute({
        sql: 'SELECT * FROM user_progress WHERE user_key = ? AND lesson_id = ?',
        args: [userKey, lessonId]
    });
    return result.rows[0] as unknown as UserProgress | undefined;
}

export async function updateWatchTime(userKey: string, lessonId: number, seconds: number): Promise<void> {
    // Get or create progress
    const existing = await getProgress(userKey, lessonId);

    if (existing) {
        await db.execute({
            sql: 'UPDATE user_progress SET watch_time_seconds = ?, last_viewed = CURRENT_TIMESTAMP WHERE user_key = ? AND lesson_id = ?',
            args: [seconds, userKey, lessonId]
        });
    } else {
        await db.execute({
            sql: 'INSERT INTO user_progress (user_key, lesson_id, watch_time_seconds, last_viewed) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
            args: [userKey, lessonId, seconds]
        });
    }
}

export async function markAsCompleted(userKey: string, lessonId: number, lessonPoints: number, minWatchTime: number): Promise<void> {
    const progress = await getProgress(userKey, lessonId);

    if (!progress) {
        throw new Error('Progress not found');
    }

    // Check if minimum watch time requirement is met (in minutes)
    const watchTimeMinutes = progress.watch_time_seconds / 60;
    const pointsToAward = watchTimeMinutes >= minWatchTime ? lessonPoints : 0;

    await db.execute({
        sql: `UPDATE user_progress 
              SET completed = 1, points_earned = ?, completed_at = CURRENT_TIMESTAMP 
              WHERE user_key = ? AND lesson_id = ?`,
        args: [pointsToAward, userKey, lessonId]
    });
}

export async function toggleFavorite(userKey: string, lessonId: number): Promise<void> {
    const progress = await getProgress(userKey, lessonId);

    if (progress) {
        await db.execute({
            sql: 'UPDATE user_progress SET favorited = NOT favorited WHERE user_key = ? AND lesson_id = ?',
            args: [userKey, lessonId]
        });
    } else {
        await db.execute({
            sql: 'INSERT INTO user_progress (user_key, lesson_id, favorited) VALUES (?, ?, 1)',
            args: [userKey, lessonId]
        });
    }
}

export async function saveNotes(userKey: string, lessonId: number, notes: string): Promise<void> {
    const progress = await getProgress(userKey, lessonId);

    if (progress) {
        await db.execute({
            sql: 'UPDATE user_progress SET notes = ? WHERE user_key = ? AND lesson_id = ?',
            args: [notes, userKey, lessonId]
        });
    } else {
        await db.execute({
            sql: 'INSERT INTO user_progress (user_key, lesson_id, notes) VALUES (?, ?, ?)',
            args: [userKey, lessonId, notes]
        });
    }
}

export async function getUserPoints(userKey: string): Promise<number> {
    const result = await db.execute({
        sql: 'SELECT SUM(points_earned) as total FROM user_progress WHERE user_key = ?',
        args: [userKey]
    });
    return (result.rows[0] as any).total || 0;
}

export async function getUserLevel(points: number): Promise<string> {
    if (points >= 151) return 'Mestre';
    if (points >= 51) return 'Intermediário';
    return 'Aprendiz';
}

export async function getRecentLessons(userKey: string, limit: number = 5): Promise<number[]> {
    const result = await db.execute({
        sql: 'SELECT lesson_id FROM user_progress WHERE user_key = ? ORDER BY last_viewed DESC LIMIT ?',
        args: [userKey, limit]
    });
    return result.rows.map((row: any) => row.lesson_id);
}

export async function getFavoriteLessons(userKey: string): Promise<number[]> {
    const result = await db.execute({
        sql: 'SELECT lesson_id FROM user_progress WHERE user_key = ? AND favorited = 1 ORDER BY last_viewed DESC',
        args: [userKey]
    });
    return result.rows.map((row: any) => row.lesson_id);
}
