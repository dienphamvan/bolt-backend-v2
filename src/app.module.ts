import { Module } from '@nestjs/common';
import { CustomerModule } from './customer/customer.module';
import { PrismaModule } from './prisma/prisma.module';
import { CarModule } from './car/car.module';
import { AppController } from './app.controller';

@Module({
  imports: [CustomerModule, PrismaModule, CarModule],
  controllers: [AppController],
})
export class AppModule {}
