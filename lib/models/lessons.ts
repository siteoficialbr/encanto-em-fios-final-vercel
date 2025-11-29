import db from '../db';

export interface Lesson {
    id: number;
    title: string;
    video_id: string;
    cover_image: string | null;
    seal_difficulty: string | null;
    seal_time_value: string | null;
    seal_time_color: string | null;
    description: string | null;
    materials: string | null;
    steps: string | null;
    order_num: number;
    points: number;
    min_watch_time: number;
    created_at: string;
}

export async function getAllLessons(): Promise<Lesson[]> {
    const result = await db.execute('SELECT * FROM lessons ORDER BY order_num ASC');
    return result.rows as unknown as Lesson[];
}

export async function getLessonById(id: number): Promise<Lesson | undefined> {
    const result = await db.execute({
        sql: 'SELECT * FROM lessons WHERE id = ?',
        args: [id]
    });
    return result.rows[0] as unknown as Lesson | undefined;
}

export interface CreateLessonData {
    title: string;
    video_id: string;
    cover_image?: string;
    seal_difficulty?: string;
    seal_time_value?: string;
    seal_time_color?: string;
    description?: string;
    materials?: string;
    steps?: string;
    order_num: number;
    points?: number;
    min_watch_time?: number;
}

export async function createLesson(data: CreateLessonData): Promise<Lesson> {
    const result = await db.execute({
        sql: `INSERT INTO lessons (
          title, video_id, cover_image, seal_difficulty, seal_time_value, seal_time_color,
          description, materials, steps, order_num, points, min_watch_time
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
            data.title,
            data.video_id,
            data.cover_image || null,
            data.seal_difficulty || null,
            data.seal_time_value || null,
            data.seal_time_color || null,
            data.description || null,
            data.materials || null,
            data.steps || null,
            data.order_num,
            data.points || 10,
            data.min_watch_time || 10
        ]
    });

    return {
        id: Number(result.lastInsertRowid),
        title: data.title,
        video_id: data.video_id,
        cover_image: data.cover_image || null,
        seal_difficulty: data.seal_difficulty || null,
        seal_time_value: data.seal_time_value || null,
        seal_time_color: data.seal_time_color || null,
        description: data.description || null,
        materials: data.materials || null,
        steps: data.steps || null,
        order_num: data.order_num,
        points: data.points || 10,
        min_watch_time: data.min_watch_time || 10,
        created_at: new Date().toISOString()
    };
}

export interface UpdateLessonData {
    title?: string;
    video_id?: string;
    cover_image?: string;
    seal_difficulty?: string;
    seal_time_value?: string;
    seal_time_color?: string;
    description?: string;
    materials?: string;
    steps?: string;
    order_num?: number;
    points?: number;
    min_watch_time?: number;
}

export async function updateLesson(id: number, data: UpdateLessonData): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) {
        fields.push('title = ?');
        values.push(data.title);
    }
    if (data.video_id !== undefined) {
        fields.push('video_id = ?');
        values.push(data.video_id);
    }
    if (data.cover_image !== undefined) {
        fields.push('cover_image = ?');
        values.push(data.cover_image);
    }
    if (data.seal_difficulty !== undefined) {
        fields.push('seal_difficulty = ?');
        values.push(data.seal_difficulty);
    }
    if (data.seal_time_value !== undefined) {
        fields.push('seal_time_value = ?');
        values.push(data.seal_time_value);
    }
    if (data.seal_time_color !== undefined) {
        fields.push('seal_time_color = ?');
        values.push(data.seal_time_color);
    }
    if (data.description !== undefined) {
        fields.push('description = ?');
        values.push(data.description);
    }
    if (data.materials !== undefined) {
        fields.push('materials = ?');
        values.push(data.materials);
    }
    if (data.steps !== undefined) {
        fields.push('steps = ?');
        values.push(data.steps);
    }
    if (data.order_num !== undefined) {
        fields.push('order_num = ?');
        values.push(data.order_num);
    }
    if (data.points !== undefined) {
        fields.push('points = ?');
        values.push(data.points);
    }
    if (data.min_watch_time !== undefined) {
        fields.push('min_watch_time = ?');
        values.push(data.min_watch_time);
    }

    if (fields.length === 0) return;

    values.push(id);
    await db.execute({
        sql: `UPDATE lessons SET ${fields.join(', ')} WHERE id = ?`,
        args: values
    });
}

export async function deleteLesson(id: number): Promise<void> {
    await db.execute({
        sql: 'DELETE FROM lessons WHERE id = ?',
        args: [id]
    });
}
