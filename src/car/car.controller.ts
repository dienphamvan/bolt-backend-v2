import { Controller, Get, Param, Query } from '@nestjs/common';
import { CarService } from './car.service';
import { ViewAvailabilityRequest } from './dto/ViewAvailabilityRequest.dto';
import { GetCarByIdRequest } from './dto/GetCarByIdRequest.dto';

@Controller('car')
export class CarController {
  constructor(private readonly carService: CarService) {}

  @Get('availability')
  viewAvailability(@Query() dto: ViewAvailabilityRequest) {
    return this.carService.viewAvailability(dto);
  }

  @Get(':id')
  getCarById(@Param('id') id: string, @Query() dto: GetCarByIdRequest) {
    return this.carService.getCarById(id, dto);
  }
}
