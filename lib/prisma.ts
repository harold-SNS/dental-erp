import { neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from './generated/prisma/client'
import ws from 'ws'

type Adapter = NonNullable<ConstructorParameters<typeof PrismaClient>[0]['adapter']>

// Neon uses WebSockets in serverless Node.js environments. Supplying ws keeps
// the transport explicit and consistent across local development and Vercel.
neonConfig.webSocketConstructor = ws

function createAdapter(): Adapter {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    // next build imports this module without requiring a live database.
    return {
      provider: 'postgres',
      adapterName: '@prisma/adapter-neon',
      connect: () => Promise.reject(new Error('DATABASE_URL is not set')),
    }
  }

  if (!/^postgres(?:ql)?:\/\//i.test(connectionString)) {
    throw new Error('DATABASE_URL must be a PostgreSQL URL for Neon')
  }

  return new PrismaNeon({ connectionString })
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: createAdapter(),
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

// Reuse one Prisma client/pool per server process across Next.js server chunks.
globalForPrisma.prisma = prisma

export default prisma
