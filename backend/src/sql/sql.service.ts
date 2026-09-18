import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { Pool, QueryResult, QueryResultRow } from 'pg'

type SqlQuery = <T extends QueryResultRow>(text: string, params?: unknown[]) => Promise<QueryResult<T>>

@Injectable()
export class SqlService implements OnModuleInit, OnModuleDestroy {
  private readonly pool = new Pool({ connectionString: process.env.DATABASE_URL })

  async onModuleInit() {
    await this.pool.query('SELECT 1')
  }

  async onModuleDestroy() {
    await this.pool.end()
  }

  query<T extends QueryResultRow>(text: string, params?: unknown[]) {
    return this.pool.query<T>(text, params)
  }

  async transaction<T>(fn: (query: SqlQuery) => Promise<T>): Promise<T> {
    const client = await this.pool.connect()
    try {
      await client.query('BEGIN')
      const result = await fn((text, params) => client.query(text, params))
      await client.query('COMMIT')
      return result
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }
}
