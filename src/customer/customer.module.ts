import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { CarModule } from 'src/car/car.module';

@Module({
  imports: [CarModule],
  controllers: [CustomerController],
  providers: [CustomerService],
})
export class CustomerModule {}
