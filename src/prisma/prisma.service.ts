import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

type PrismaServiceType = PrismaClient<
  Prisma.PrismaClientOptions,
  'query' | 'error' | 'info' | 'warn'
>;

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'event' },
      ],
    });
  }

  async onModuleInit() {
    await this.$connect();

    (this as PrismaServiceType).$on('query', (e) => {
      console.log(`Query: ${e.query}`);
      console.log(`Params: ${e.params}`);
      console.log(`Duration: ${e.duration}ms`);
    });

    (this as PrismaServiceType).$on('error', (e) => {
      console.error(`Error: ${e.message}`);
      console.error(`Target: ${e.target}`);
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
