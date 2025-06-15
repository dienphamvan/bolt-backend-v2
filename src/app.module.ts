import { Module } from '@nestjs/common';
import { CustomerModule } from './customer/customer.module';
import { PrismaModule } from './prisma/prisma.module';
import { CarModule } from './car/car.module';

@Module({
  imports: [CustomerModule, PrismaModule, CarModule],
})
export class AppModule {}
