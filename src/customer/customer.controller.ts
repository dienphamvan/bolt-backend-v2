import { Body, Controller, Post } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { BookingRequest } from './dto/BookingRequest.dto';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post('booking')
  createBooking(@Body() dto: BookingRequest) {
    return this.customerService.createBooking(dto);
  }
}
