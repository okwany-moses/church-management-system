import pg from "pg";

// node-postgres returns bigint (int8) and numeric values as strings by default.
// The application code (and the SQLite implementation it replaced) expects plain
// JavaScript numbers from COUNT(*) / SUM(...), so coerce those types to numbers.
pg.types.setTypeParser(20, (v) => (v === null ? null : parseInt(v, 10))); // int8
pg.types.setTypeParser(1700, (v) => (v === null ? null : parseFloat(v))); // numeric

// Tables whose primary key is a serial `id`. Used to emulate SQLite's
// `result.lastID` by appending `RETURNING id` to inserts automatically.
const ID_TABLES = new Set([
  "members",
  "users",
  "ministries",
  "attendance_sessions",
  "contributions",
  "events",
  "branches",
  "cell_groups",
  "expenditures",
  "sms_logs",
  "video_call_logs",
  "sermons",
  "prayer_requests",
  "hymns",
]);

export interface RunResult {
  lastID: number | undefined;
  changes: number;
}

/**
 * Thin compatibility layer exposing the subset of the `sqlite` package API used
 * by the application (`exec`, `run`, `get`, `all`) on top of `pg`. This lets the
 * existing query code run against PostgreSQL with minimal changes:
 *  - `?` placeholders are translated to `$1, $2, ...`
 *  - `run()` returns `{ lastID, changes }` like the sqlite wrapper
 *  - SQLite-only statements (PRAGMA, sqlite_sequence) are ignored
 */
export class PgDatabase {
  private pool: pg.Pool;

  constructor(connectionString: string) {
    const isLocal = /@(localhost|127\.0\.0\.1)/.test(connectionString);
    const sslDisabled = process.env.PGSSL === "false" || isLocal;
    this.pool = new pg.Pool({
      connectionString,
      ssl: sslDisabled ? undefined : { rejectUnauthorized: false },
    });
  }

  private normalizeParams(params: unknown[]): unknown[] {
    if (params.length === 1 && Array.isArray(params[0])) return params[0];
    return params;
  }

  private convert(sql: string): string {
    let i = 0;
    return sql.replace(/\?/g, () => `$${++i}`);
  }

  async exec(sql: string): Promise<void> {
    const trimmed = sql.trim();
    // SQLite-only statements with no PostgreSQL equivalent.
    if (/^PRAGMA/i.test(trimmed)) return;
    if (/sqlite_sequence/i.test(trimmed)) return;
    await this.pool.query(sql);
  }

  async all<T = any>(sql: string, ...params: unknown[]): Promise<T[]> {
    const res = await this.pool.query(this.convert(sql), this.normalizeParams(params));
    return res.rows as T[];
  }

  async get<T = any>(sql: string, ...params: unknown[]): Promise<T | undefined> {
    const res = await this.pool.query(this.convert(sql), this.normalizeParams(params));
    return res.rows[0] as T | undefined;
  }

  async run(sql: string, ...params: unknown[]): Promise<RunResult> {
    let text = sql.trim();
    const match = /^insert\s+into\s+"?([a-z_]+)"?/i.exec(text);
    if (match && ID_TABLES.has(match[1].toLowerCase()) && !/returning/i.test(text)) {
      text = text.replace(/;\s*$/, "") + " RETURNING id";
    }
    const res = await this.pool.query(this.convert(text), this.normalizeParams(params));
    const lastID = res.rows && res.rows[0] ? (res.rows[0] as { id?: number }).id : undefined;
    return { lastID, changes: res.rowCount ?? 0 };
  }
}
