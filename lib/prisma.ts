
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5, // Limit connections for Vercel Free
});

export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
  // Add common queries
  users: {
    findUnique: (where: { id?: string; email?: string }) => {
      let query = 'SELECT * FROM users WHERE ';
      const params = [];
      if (where.id) {
        query += 'id = $1';
        params.push(where.id);
      } else if (where.email) {
        query += 'email = $1';
        params.push(where.email);
      }
      return db.query(query, params).then(res => res.rows[0]);
    },
    findMany: () => db.query('SELECT id, email FROM users').then(res => res.rows),
    create: (data: { email: string; password: string; name?: string }) =>
      db.query('INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING *', [data.email, data.password, data.name]).then(res => res.rows[0]),
    update: (where: { id: string }, data: Partial<{ email: string; password: string; name: string }>) => {
      const sets = [];
      const params = [];
      if (data.email) { sets.push('email = $' + (params.length + 1)); params.push(data.email); }
      if (data.password) { sets.push('password = $' + (params.length + 1)); params.push(data.password); }
      if (data.name) { sets.push('name = $' + (params.length + 1)); params.push(data.name); }
      params.push(where.id);
      return db.query(`UPDATE users SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`, params).then(res => res.rows[0]);
    },
  },
  // Add other tables as needed
};

export const prisma = db; // Alias for compatibility

