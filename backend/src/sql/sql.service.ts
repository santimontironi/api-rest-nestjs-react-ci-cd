import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { Pool } from 'pg'

@Injectable()
export class SqlService implements OnModuleInit, OnModuleDestroy {
  readonly pool = new Pool({ connectionString: process.env.DATABASE_URL })

  async onModuleInit() {
    await this.pool.query('SELECT 1')
  }

  async onModuleDestroy() {
    await this.pool.end()
  }
}
