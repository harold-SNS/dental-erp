import { defineConfig } from 'prisma/config'

// Prisma 7 CLI configuration. Use Neon’s direct (non-pooler) connection for
// schema operations; the application uses the pooled DATABASE_URL at runtime.
try {
  process.loadEnvFile()
} catch {
  // No local .env file.
}

const directUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  ...(directUrl ? { datasource: { url: directUrl } } : {}),
})
