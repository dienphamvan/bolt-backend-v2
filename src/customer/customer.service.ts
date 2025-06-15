import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ViewAvailabilityRequest } from './dto/ViewAvailabilityRequest.dto';
import * as moment from 'moment';
import { Booking, Car, SeasonalPricing } from '@prisma/client';
import { getSeasonForDate } from 'src/common/utils/getSeasonForDate';
import { BookingRequest } from './dto/BookingRequest.dto';

@Injectable()
export class CustomerService {
  constructor(private readonly prismaService: PrismaService) {}

  async viewAvailability({ startDate, endDate }: ViewAvailabilityRequest) {
    // Later: Pagination can be added here

    const bookings = await this.getBookingCountByDate({
      startDate,
      endDate,
    });

    const bookingMap = new Map(
      bookings.map((booking) => [booking.carId, booking._count]),
    );

    const cars = await this.prismaService.car.findMany({
      include: {
        pricing: true,
      },
    });

    const availableCars = cars.filter((car) => {
      const booked = bookingMap.get(car.id) || 0;
      return car.stock > booked;
    });

    const result = availableCars.map((car) => {
      const { avgPricePerDay, totalPrice } = this.calculateTotalPricePerDay({
        car,
        startDate,
        endDate,
      });

      return {
        brand: car.brand,
        model: car.model,
        availableStock: car.stock - (bookingMap.get(car.id) || 0),
        avgPricePerDay,
        totalPrice,
      };
    });

    return result;
  }

  async createBooking(dto: BookingRequest) {
    // Later: Can add logic send verification email here
    // Later: Can add logic to check license validity here

    const startDate = moment.utc(dto.startDate).toDate();
    const endDate = moment.utc(dto.endDate).toDate();

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
        validUntil: moment(dto.licenseValidUntil).toDate(),
      },
      create: {
        userId: user.id,
        number: dto.licenseNumber,
        validUntil: moment(dto.licenseValidUntil).toDate(),
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

    let booking = await this.prismaService.$transaction(async (prisma) => {
      // Prevent race condition
      const car = await prisma.car.findFirst({
        where: { id: dto.carId },
        include: { pricing: true },
      });

      if (!car) {
        throw new NotFoundException('Car not found.');
      }

      if (car.stock <= 0) {
        throw new BadRequestException('Car is out of stock.');
      }

      const { totalPrice } = this.calculateTotalPricePerDay({
        car,
        startDate: dto.startDate,
        endDate: dto.endDate,
      });

      const booking = await prisma.booking.create({
        data: {
          userId: user.id,
          carId: dto.carId,
          startDate,
          endDate,
          totalPrice,
        },
      });

      await prisma.car.update({
        where: { id: dto.carId },
        data: {
          stock: {
            decrement: 1,
          },
        },
      });

      return booking;
    });

    if (!booking) {
      throw new BadRequestException('Booking could not be created.');
    }

    return booking;
  }

  private calculateTotalPricePerDay({
    car,
    startDate,
    endDate,
  }: {
    car: Car & { pricing: SeasonalPricing[] };
    startDate: string;
    endDate: string;
  }) {
    let totalPrice = 0;

    const numberOfDays = moment(endDate).diff(moment(startDate), 'days') + 1;

    const startMoment = moment(startDate);
    for (let i = 0; i < numberOfDays; i++) {
      const currentDate = startMoment.clone().add(i, 'days').toDate();
      const season = getSeasonForDate(currentDate);

      const seasonalPricing = car.pricing.find(
        (pricing) => pricing.season === season,
      );

      if (!seasonalPricing) {
        throw new BadRequestException(`No pricing found for season: ${season}`);
      }

      totalPrice += Number(seasonalPricing.price);
    }

    const avgPricePerDay = totalPrice / numberOfDays;
    return {
      totalPrice,
      avgPricePerDay,
    };
  }

  private async getBookingCountByDate({
    startDate,
    endDate,
  }: {
    startDate: string;
    endDate: string;
  }) {
    const bookings = await this.prismaService.booking.groupBy({
      by: ['carId'],
      _count: true,
      where: {
        OR: [
          {
            startDate: {
              gte: moment(startDate).toDate(),
              lte: moment(endDate).toDate(),
            },
          },
          {
            endDate: {
              gte: moment(startDate).toDate(),
              lte: moment(endDate).toDate(),
            },
          },
        ],
      },
    });

    return bookings;
  }
}
