import { Pool, QueryResult } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5, // Limit connections for Vercel Free
});

export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
  // Add common queries
  users: {
    findUnique: (args: { where: { id?: string; email?: string }, select?: { id?: boolean; email?: boolean; plan?: boolean; role?: boolean; passwordHash?: boolean } }) => {
      const { where, select } = args;
      let query = 'SELECT ';
      if (select) {
        const columns = [];
        if (select.id) columns.push('id');
        if (select.email) columns.push('email');
        if (select.plan) columns.push('plan');
        if (select.role) columns.push('role');
        if (select.passwordHash) columns.push('"passwordHash"');
        query += columns.join(', ') + ' FROM "User" WHERE ';
      } else {
        query += '* FROM "User" WHERE ';
      }
      const params = [];
      if (where.id) {
        query += 'id = $1';
        params.push(where.id);
      } else if (where.email) {
        query += 'email = $1';
        params.push(where.email);
      }
      return db.query(query, params).then((res: QueryResult) => res.rows[0]);
    },
    findMany: () => db.query('SELECT id, email FROM "User"').then((res: QueryResult) => res.rows),
    create: (data: { email: string; passwordHash: string; name?: string; plan?: string; role?: string }) =>
      db.query('INSERT INTO "User" (email, "passwordHash", name, plan, role) VALUES ($1, $2, $3, $4, $5) RETURNING *', [data.email, data.passwordHash, data.name || null, data.plan || 'FREE', data.role || 'USER']).then((res: QueryResult) => res.rows[0]),
    update: (where: { id: string }, data: Partial<{ email: string; passwordHash: string; name: string; plan: string; role: string; emailVerified: boolean }>) => {
      const sets = [];
      const params = [];
      if (data.email) { sets.push('email = $' + (params.length + 1)); params.push(data.email); }
      if (data.passwordHash) { sets.push('"passwordHash" = $' + (params.length + 1)); params.push(data.passwordHash); }
      if (data.name !== undefined) { sets.push('name = $' + (params.length + 1)); params.push(data.name); }
      if (data.plan) { sets.push('plan = $' + (params.length + 1)); params.push(data.plan); }
      if (data.role) { sets.push('role = $' + (params.length + 1)); params.push(data.role); }
      params.push(where.id);
      return db.query(`UPDATE "User" SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`, params).then((res: QueryResult) => res.rows[0]);
    },
    upsert: async (args: { where: { email: string }, update: any, create: any, select?: { id?: boolean; email?: boolean; plan?: boolean; role?: boolean } }) => {
      const existing = await db.users.findUnique(args.where, args.select);
      if (existing) {
        return db.users.update({ id: existing.id }, args.update);
      } else {
        return db.users.create(args.create);
      }
    },
  },
  sessions: {
    create: (data: { userId: string; expiresAt: Date; ip?: string; userAgent?: string }) =>
      db.query('INSERT INTO "Session" ("userId", "expiresAt", ip, "userAgent") VALUES ($1, $2, $3, $4) RETURNING *', [data.userId, data.expiresAt, data.ip || null, data.userAgent || null]).then((res: QueryResult) => res.rows[0]),
  },
  authTokens: {
    updateMany: (args: { where: { type?: string; identifier?: string; consumedAt?: null; expiresAt?: { gt: Date } }, data: { consumedAt: Date } }) => {
      const { where, data } = args;
      let query = 'UPDATE "AuthToken" SET "consumedAt" = $1 WHERE ';
      const params = [data.consumedAt];
      const conditions = [];
      if (where.type) { conditions.push('type = $' + (params.length + 1)); params.push(where.type); }
      if (where.identifier) { conditions.push('identifier = $' + (params.length + 1)); params.push(where.identifier); }
      if (where.consumedAt === null) { conditions.push('"consumedAt" IS NULL'); }
      if (where.expiresAt?.gt) { conditions.push('"expiresAt" > $' + (params.length + 1)); params.push(where.expiresAt.gt); }
      query += conditions.join(' AND ');
      return db.query(query, params);
    },
    findFirst: (args: { where: { type?: string; identifier?: string; tokenHash?: string; consumedAt?: null; expiresAt?: { gt: Date } }, select?: { id?: boolean; userId?: boolean } }) => {
      const { where, select } = args;
      let query = 'SELECT ';
      if (select) {
        const columns = [];
        if (select.id) columns.push('id');
        if (select.userId) columns.push('"userId"');
        query += columns.join(', ');
      } else {
        query += '*';
      }
      query += ' FROM "AuthToken" WHERE ';
      const params = [];
      const conditions = [];
      if (where.type) { conditions.push('type = $' + (params.length + 1)); params.push(where.type); }
      if (where.identifier) { conditions.push('identifier = $' + (params.length + 1)); params.push(where.identifier); }
      if (where.tokenHash) { conditions.push('"tokenHash" = $' + (params.length + 1)); params.push(where.tokenHash); }
      if (where.consumedAt === null) { conditions.push('"consumedAt" IS NULL'); }
      if (where.expiresAt?.gt) { conditions.push('"expiresAt" > $' + (params.length + 1)); params.push(where.expiresAt.gt); }
      query += conditions.join(' AND ') + ' LIMIT 1';
      return db.query(query, params).then((res: QueryResult) => res.rows[0]);
    },
    update: (args: { where: { id: string }, data: { consumedAt: Date } }) => {
      const { where, data } = args;
      return db.query('UPDATE "AuthToken" SET "consumedAt" = $1 WHERE id = $2', [data.consumedAt, where.id]);
    },
    create: (data: { type: string; identifier: string; tokenHash: string; expiresAt: Date; ip?: string; userAgent?: string; userId: string }) =>
      db.query('INSERT INTO "AuthToken" (type, identifier, "tokenHash", "expiresAt", ip, "userAgent", "userId") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [data.type, data.identifier, data.tokenHash, data.expiresAt, data.ip || null, data.userAgent || null, data.userId]).then((res: QueryResult) => res.rows[0]),
  },
  weeklyBriefs: {
    findUnique: (where: { userId: string; weekStart: Date }, select?: { id?: boolean; content?: boolean; updatedAt?: boolean }) => {
      let query = 'SELECT ';
      if (select) {
        const columns = [];
        if (select.id) columns.push('id');
        if (select.content) columns.push('content');
        if (select.updatedAt) columns.push('"updatedAt"');
        query += columns.join(', ') + ' FROM "WeeklyBrief" WHERE "userId" = $1 AND "weekStart" = $2';
      } else {
        query += '* FROM "WeeklyBrief" WHERE "userId" = $1 AND "weekStart" = $2';
      }
      return db.query(query, [where.userId, where.weekStart]).then((res: QueryResult) => res.rows[0]);
    },
    create: (data: { userId: string; weekStart: Date; content: any }) =>
      db.query('INSERT INTO "WeeklyBrief" ("userId", "weekStart", content) VALUES ($1, $2, $3) RETURNING *', [data.userId, data.weekStart, JSON.stringify(data.content)]).then((res: QueryResult) => res.rows[0]),
    update: (where: { userId: string; weekStart: Date }, data: { content: any }) =>
      db.query('UPDATE "WeeklyBrief" SET content = $1 WHERE "userId" = $2 AND "weekStart" = $3 RETURNING *', [JSON.stringify(data.content), where.userId, where.weekStart]).then((res: QueryResult) => res.rows[0]),
  },
  signals: {
    findMany: (args: { where: { userId: string; createdAt?: { gte: Date } }, orderBy?: Array<{ score?: 'desc'; createdAt?: 'desc' }>, take?: number, select?: { title?: boolean; summary?: boolean; source?: boolean; intent?: boolean; score?: boolean; createdAt?: boolean; growthPct?: boolean } }) => {
      const { where, orderBy, take, select } = args;
      let query = 'SELECT ';
      if (select) {
        const columns = [];
        if (select.title) columns.push('title');
        if (select.summary) columns.push('summary');
        if (select.source) columns.push('source');
        if (select.intent) columns.push('intent');
        if (select.score) columns.push('"score"');
        if (select.createdAt) columns.push('"createdAt"');
        if (select.growthPct) columns.push('"growthPct"');
        query += columns.join(', ');
      } else {
        query += '*';
      }
      query += ' FROM "Signal" WHERE "userId" = $1';
      const params = [where.userId];
      if (where.createdAt?.gte) {
        query += ' AND "createdAt" >= $' + (params.length + 1);
        params.push(where.createdAt.gte);
      }
      if (orderBy) {
        const orders = [];
        for (const ob of orderBy) {
          if (ob.score === 'desc') orders.push('"score" DESC');
          if (ob.createdAt === 'desc') orders.push('"createdAt" DESC');
        }
        if (orders.length) query += ' ORDER BY ' + orders.join(', ');
      }
      if (take) {
        query += ' LIMIT $' + (params.length + 1);
        params.push(take);
      }
      return db.query(query, params).then((res: QueryResult) => res.rows);
    },
    findFirst: (args: { where: { id: string; userId: string }, select?: { id?: boolean; title?: boolean; summary?: boolean } }) => {
      const { where, select } = args;
      let query = 'SELECT ';
      if (select) {
        const columns = [];
        if (select.id) columns.push('id');
        if (select.title) columns.push('title');
        if (select.summary) columns.push('summary');
        query += columns.join(', ');
      } else {
        query += '*';
      }
      query += ' FROM "Signal" WHERE id = $1 AND "userId" = $2 LIMIT 1';
      return db.query(query, [where.id, where.userId]).then((res: QueryResult) => res.rows[0]);
    },
    count: (args: { where: { userId: string } }) => {
      const { where } = args;
      return db.query('SELECT COUNT(*) as count FROM "Signal" WHERE "userId" = $1', [where.userId]).then((res: QueryResult) => parseInt(res.rows[0].count));
    },
    createMany: (args: { data: Array<{ userId: string; source: string; title: string; summary: string; intent: string; score: number; growthPct: number }> }) => {
      const { data } = args;
      const values = [];
      const params = [];
      for (const item of data) {
        values.push(`($${params.length + 1}, $${params.length + 2}, $${params.length + 3}, $${params.length + 4}, $${params.length + 5}, $${params.length + 6}, $${params.length + 7})`);
        params.push(item.userId, item.source, item.title, item.summary, item.intent, item.score, item.growthPct);
      }
      const query = `INSERT INTO "Signal" ("userId", source, title, summary, intent, "score", "growthPct") VALUES ${values.join(', ')}`;
      return db.query(query, params);
    },
  },
  insights: {
    findFirst: (args: { where: { signalId: string }, orderBy?: { createdAt?: 'desc' }, select?: { id?: boolean; strategic?: boolean; actionable?: boolean; confidence?: boolean } }) => {
      const { where, orderBy, select } = args;
      let query = 'SELECT ';
      if (select) {
        const columns = [];
        if (select.id) columns.push('id');
        if (select.strategic) columns.push('strategic');
        if (select.actionable) columns.push('actionable');
        if (select.confidence) columns.push('confidence');
        query += columns.join(', ');
      } else {
        query += '*';
      }
      query += ' FROM "Insight" WHERE "signalId" = $1';
      const params = [where.signalId];
      if (orderBy?.createdAt === 'desc') {
        query += ' ORDER BY "createdAt" DESC';
      }
      query += ' LIMIT 1';
      return db.query(query, params).then((res: QueryResult) => res.rows[0]);
    },
    create: (data: { signalId: string; strategic: string; actionable: string; confidence: number; model?: string }) =>
      db.query('INSERT INTO "Insight" ("signalId", strategic, actionable, confidence, model) VALUES ($1, $2, $3, $4, $5) RETURNING *', [data.signalId, data.strategic, data.actionable, data.confidence, data.model || null]).then((res: QueryResult) => res.rows[0]),
  },
  usageDays: {
    upsert: (args: { where: { userId: string; day: Date }, update: any, create: { userId: string; day: Date }, select?: { id?: boolean; insightsUsed?: boolean } }) => {
      const existing = db.query('SELECT id FROM "UsageDay" WHERE "userId" = $1 AND day = $2', [args.where.userId, args.where.day]).then((res: QueryResult) => res.rows[0]);
      return existing.then((row) => {
        if (row) {
          // Update
          const sets = [];
          const params = [];
          Object.keys(args.update).forEach((key) => {
            sets.push(`"${key}" = $${params.length + 1}`);
            params.push(args.update[key]);
          });
          params.push(row.id);
          return db.query(`UPDATE "UsageDay" SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`, params).then((res: QueryResult) => res.rows[0]);
        } else {
          // Create
          return db.query('INSERT INTO "UsageDay" ("userId", day) VALUES ($1, $2) RETURNING *', [args.create.userId, args.create.day]).then((res: QueryResult) => res.rows[0]);
        }
      });
    },
    update: (args: { where: { userId_day: { userId: string; day: Date } } | { id: string }, data: { insightsUsed: { increment: number } } | { signalsSeen: { increment: number }; points: { increment: number } } }) => {
      if ('id' in args.where) {
        // Update by id
        const { where, data } = args;
        let query = 'UPDATE "UsageDay" SET ';
        const params = [];
        if (data.signalsSeen?.increment) {
          query += '"signalsSeen" = "signalsSeen" + $1';
          params.push(data.signalsSeen.increment);
        }
        if (data.points?.increment) {
          if (params.length > 0) query += ', ';
          query += '"points" = "points" + $1';
          params.push(data.points.increment);
        }
        query += ' WHERE id = $' + (params.length + 1);
        params.push(where.id);
        return db.query(query, params);
      } else {
        // Update by compound key
        const { userId, day } = args.where.userId_day;
        const { data } = args;
        let query = 'UPDATE "UsageDay" SET ';
        const params = [];
        if (data.insightsUsed?.increment) {
          query += '"insightsUsed" = "insightsUsed" + $1';
          params.push(data.insightsUsed.increment);
        }
        query += ' WHERE "userId" = $' + (params.length + 1) + ' AND day = $' + (params.length + 2);
        params.push(userId, day);
        return db.query(query, params);
      }
    },
    updateMany: (args: { where: { userId: string; day?: { gte: Date } }, data: { points?: { increment: number } } }) => {
      const { where, data } = args;
      let query = 'UPDATE "UsageDay" SET ';
      const params = [];
      if (data.points?.increment) {
        query += '"points" = "points" + $1';
        params.push(data.points.increment);
      }
      query += ' WHERE "userId" = $' + (params.length + 1);
      params.push(where.userId);
      if (where.day?.gte) {
        query += ' AND day >= $' + (params.length + 1);
        params.push(where.day.gte);
      }
      return db.query(query, params);
    },
  },
  badgeUnlocks: {
    upsert: (args: { where: { userId: string; key: string }, update: any, create: { userId: string; key: string } }) => {
      const existing = db.query('SELECT id FROM "BadgeUnlock" WHERE "userId" = $1 AND key = $2', [args.where.userId, args.where.key]).then((res: QueryResult) => res.rows[0]);
      return existing.then((row) => {
        if (row) {
          // Update
          const sets = [];
          const params = [];
          Object.keys(args.update).forEach((key) => {
            sets.push(`"${key}" = $${params.length + 1}`);
            params.push(args.update[key]);
          });
          params.push(row.id);
          return db.query(`UPDATE "BadgeUnlock" SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`, params).then((res: QueryResult) => res.rows[0]);
        } else {
          // Create
          return db.query('INSERT INTO "BadgeUnlock" ("userId", key) VALUES ($1, $2) RETURNING *', [args.create.userId, args.create.key]).then((res: QueryResult) => res.rows[0]);
        }
      });
    },
  },
  executionPlan: {
    findUnique: (args: { where: { userId_signalId: { userId: string; signalId: string } }, select?: { id?: boolean; hypothesis?: boolean; experiment?: boolean; metric?: boolean; updatedAt?: boolean } }) => {
      const { where, select } = args;
      let query = 'SELECT ';
      if (select) {
        const columns = [];
        if (select.id) columns.push('id');
        if (select.hypothesis) columns.push('hypothesis');
        if (select.experiment) columns.push('experiment');
        if (select.metric) columns.push('metric');
        if (select.updatedAt) columns.push('"updatedAt"');
        query += columns.join(', ') + ' FROM "ExecutionPlan" WHERE "userId" = $1 AND "signalId" = $2';
      } else {
        query += '* FROM "ExecutionPlan" WHERE "userId" = $1 AND "signalId" = $2';
      }
      return db.query(query, [where.userId_signalId.userId, where.userId_signalId.signalId]).then((res: QueryResult) => res.rows[0]);
    },
    upsert: (args: { where: { userId_signalId: { userId: string; signalId: string } }, update: { hypothesis: string; experiment: string; metric: string }, create: { userId: string; signalId: string; hypothesis: string; experiment: string; metric: string }, select?: { id?: boolean; hypothesis?: boolean; experiment?: boolean; metric?: boolean; updatedAt?: boolean } }) => {
      const existing = db.query('SELECT id FROM "ExecutionPlan" WHERE "userId" = $1 AND "signalId" = $2', [args.where.userId_signalId.userId, args.where.userId_signalId.signalId]).then((res: QueryResult) => res.rows[0]);
      return existing.then((row) => {
        if (row) {
          // Update
          return db.query('UPDATE "ExecutionPlan" SET hypothesis = $1, experiment = $2, metric = $3, "updatedAt" = NOW() WHERE id = $4 RETURNING *', [args.update.hypothesis, args.update.experiment, args.update.metric, row.id]).then((res: QueryResult) => {
            const result = res.rows[0];
            if (args.select) {
              const selected = {};
              if (args.select.id) selected.id = result.id;
              if (args.select.hypothesis) selected.hypothesis = result.hypothesis;
              if (args.select.experiment) selected.experiment = result.experiment;
              if (args.select.metric) selected.metric = result.metric;
              if (args.select.updatedAt) selected.updatedAt = result.updatedAt;
              return selected;
            }
            return result;
          });
        } else {
          // Create
          return db.query('INSERT INTO "ExecutionPlan" ("userId", "signalId", hypothesis, experiment, metric) VALUES ($1, $2, $3, $4, $5) RETURNING *', [args.create.userId, args.create.signalId, args.create.hypothesis, args.create.experiment, args.create.metric]).then((res: QueryResult) => {
            const result = res.rows[0];
            if (args.select) {
              const selected = {};
              if (args.select.id) selected.id = result.id;
              if (args.select.hypothesis) selected.hypothesis = result.hypothesis;
              if (args.select.experiment) selected.experiment = result.experiment;
              if (args.select.metric) selected.metric = result.metric;
              if (args.select.updatedAt) selected.updatedAt = result.updatedAt;
              return selected;
            }
            return result;
          });
        }
      });
    },
  },
  accessLog: {
    create: (data: { userId?: string; path: string; method: string; ip?: string; userAgent?: string; status?: number }) => {
      return db.query(
        'INSERT INTO "AccessLog" ("userId", path, method, ip, "userAgent", status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [data.userId ?? null, data.path, data.method, data.ip ?? null, data.userAgent ?? null, data.status ?? null]
      ).then((res: QueryResult) => res.rows[0]);
    },
  },
  appSecret: {
    upsert: async (args: { where: { key: string }, create: { key: string; valueEnc: string }, update?: { valueEnc?: string } }) => {
      const existing = await db.query('SELECT id FROM "AppSecret" WHERE key = $1', [args.where.key]).then((res: QueryResult) => res.rows[0]);
      if (existing) {
        return db.query('UPDATE "AppSecret" SET "valueEnc" = $1 WHERE id = $2 RETURNING *', [args.update?.valueEnc ?? args.create.valueEnc, existing.id]).then((res: QueryResult) => res.rows[0]);
      } else {
        return db.query('INSERT INTO "AppSecret" (key, "valueEnc") VALUES ($1, $2) RETURNING *', [args.create.key, args.create.valueEnc]).then((res: QueryResult) => res.rows[0]);
      }
    },
    findUnique: (args: { where: { key: string }, select?: { key?: boolean } }) => {
      let query = 'SELECT ';
      if (args.select) {
        const columns = [];
        if (args.select.key) columns.push('key');
        query += columns.join(', ');
      } else {
        query += '*';
      }
      query += ' FROM "AppSecret" WHERE key = $1';
      return db.query(query, [args.where.key]).then((res: QueryResult) => res.rows[0]);
    },
    findMany: (args: { select?: { key?: boolean } }) => {
      let query = 'SELECT ';
      if (args.select) {
        const columns = [];
        if (args.select.key) columns.push('key');
        query += columns.join(', ');
      } else {
        query += '*';
      }
      query += ' FROM "AppSecret"';
      return db.query(query).then((res: QueryResult) => res.rows);
    },
  },
};

export const prisma = db; // Alias for compatibility

