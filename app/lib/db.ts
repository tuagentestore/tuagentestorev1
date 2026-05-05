import { Pool, type QueryResult, type QueryResultRow } from 'pg'

let pool: Pool | undefined

function getPool(): Pool {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      console.error('[DB] FATAL: DATABASE_URL env var is not set. All database operations will fail.')
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 3_000,
    })
    pool.on('error', (err) => {
      console.error('[DB] Pool error:', err.message)
    })
  }
  return pool
}

export async function query<T extends QueryResultRow = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const client = await getPool().connect()
  try {
    const result: QueryResult<T> = await client.query(text, params)
    return result.rows
  } finally {
    client.release()
  }
}

export async function queryOne<T extends QueryResultRow = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(text, params)
  return rows[0] ?? null
}

export async function transaction<T>(
  fn: (q: typeof query) => Promise<T>
): Promise<T> {
  const client = await getPool().connect()
  try {
    await client.query('BEGIN')
    const boundQuery = async <R extends QueryResultRow = Record<string, unknown>>(
      text: string,
      params?: unknown[]
    ): Promise<R[]> => {
      const result: QueryResult<R> = await client.query(text, params)
      return result.rows
    }
    const result = await fn(boundQuery)
    await client.query('COMMIT')
    return result
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}
