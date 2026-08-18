import 'dotenv/config'

import { DataSource } from 'typeorm'

import { validateEnvironment } from '../config/env.validation'
import { createTypeOrmOptions } from '../config/typeorm.config'

export default new DataSource(
  createTypeOrmOptions(validateEnvironment(process.env)),
)
