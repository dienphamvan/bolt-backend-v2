import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { utc } from 'moment';
import { calculateTotalPricePerDay } from 'src/common/utils/calculateTotalPricePerDay';
import { PrismaService } from 'src/prisma/prisma.service';
import { BookingRequest } from './dto/BookingRequest.dto';
import { CarService } from 'src/car/car.service';

@Injectable()
export class CustomerService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly carService: CarService,
  ) {}

  async createBooking(dto: BookingRequest) {
    // Later: Can add logic send verification email here
    // Later: Can add logic to check license validity here

    const startDate = utc(dto.startDate).toDate();
    const endDate = utc(dto.endDate).toDate();

    const user = await this.prismaService.user.upsert({
      where: { email: dto.email },
      update: {
        name: dto.name,
      },
      create: {
        email: dto.email,
        name: dto.name,
      },
    });

    await this.prismaService.license.upsert({
      where: {
        userId: user.id,
      },
      update: {
        number: dto.licenseNumber,
        validUntil: utc(dto.licenseValidUntil).toDate(),
      },
      create: {
        userId: user.id,
        number: dto.licenseNumber,
        validUntil: utc(dto.licenseValidUntil).toDate(),
      },
    });

    const overlappingBooking = await this.prismaService.booking.findFirst({
      where: {
        userId: user.id,
        startDate: {
          lte: endDate,
        },
        endDate: {
          gte: startDate,
        },
      },
    });

    if (overlappingBooking) {
      throw new BadRequestException(
        'You already have a booking for this period.',
      );
    }

    const bookedCar = await this.carService.getBookedCarCountByDate({
      startDate: dto.startDate,
      endDate: dto.endDate,
      carId: dto.carId,
    });

    const car = await this.prismaService.car.findFirst({
      where: {
        id: dto.carId,
      },
      include: {
        pricing: true,
      },
    });

    if (!car || car.stock <= 0) {
      throw new NotFoundException('Car not found.');
    }

    if (car.stock <= (bookedCar.get(dto.carId) || 0)) {
      throw new BadRequestException(
        'Car is not available for the selected dates.',
      );
    }

    const { totalPrice } = calculateTotalPricePerDay({
      car,
      startDate: dto.startDate,
      endDate: dto.endDate,
    });

    const booking = await this.prismaService.booking.create({
      data: {
        userId: user.id,
        carId: dto.carId,
        startDate,
        endDate,
        totalPrice,
      },
    });

    if (!booking) {
      throw new BadRequestException('Booking could not be created.');
    }

    return booking;
  }
}
