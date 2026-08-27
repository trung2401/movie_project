import { globalIgnores } from 'eslint/config'
import nextConfig from 'eslint-config-next'

const eslintConfig = [
  ...nextConfig,
  globalIgnores(['**/.next/**']),
]

export default eslintConfig
