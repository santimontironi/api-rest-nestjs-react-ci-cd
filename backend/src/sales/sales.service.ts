import { Injectable } from '@nestjs/common';
import { SqlService } from '../sql/sql.service'

@Injectable()
export class SalesService {
    constructor(private readonly sql: SqlService) { }
}
