import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { BookingRequest } from './dto/BookingRequest.dto';
import { ViewAvailabilityRequest } from './dto/ViewAvailabilityRequest.dto';

@Controller()
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get('availability')
  viewAvailability(@Query() dto: ViewAvailabilityRequest) {
    return this.customerService.viewAvailability(dto);
  }

  @Post('booking')
  createBooking(@Body() dto: BookingRequest) {
    return this.customerService.createBooking(dto);
  }
}
