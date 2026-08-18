import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { DataSourceOptions } from 'typeorm'

import { EnvironmentVariables } from './env.validation'

export function createTypeOrmOptions(
  config: EnvironmentVariables,
): DataSourceOptions {
  return {
    type: 'mysql',
    host: config.DB_HOST,
    port: config.DB_PORT,
    username: config.DB_USER,
    password: config.DB_PASS,
    database: config.DB_NAME,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    migrationsTableName: 'typeorm_migrations',
    synchronize: false,
  }
}

export function createNestTypeOrmOptions(
  config: EnvironmentVariables,
): TypeOrmModuleOptions {
  return createTypeOrmOptions(config)
}
