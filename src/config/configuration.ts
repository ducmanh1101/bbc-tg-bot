type Env = 'development' | 'staging' | 'production'
const env: Env = (process.env.NODE_ENV as Env) || 'development'

const configuration = () => ({
  server: {
    env,
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 8000,
  },
  telegram: {
    tokenBot: process.env.TELEGRAM_TOKEN_BOT || '',
  },
})

export type EnvironmentVariables = ReturnType<typeof configuration>

export default configuration
