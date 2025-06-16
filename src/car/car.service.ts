import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ViewAvailabilityRequest } from '../car/dto/ViewAvailabilityRequest.dto';
import { calculateTotalPricePerDay } from 'src/common/utils/calculateTotalPricePerDay';
import { utc } from 'moment';
import { GetCarByIdRequest } from './dto/GetCarByIdRequest.dto';

@Injectable()
export class CarService {
  constructor(private readonly prismaService: PrismaService) {}

  async viewAvailability({ startDate, endDate }: ViewAvailabilityRequest) {
    // Later: Pagination can be added here

    const bookedCar = await this.getBookedCarCountByDate({
      startDate,
      endDate,
    });

    const cars = await this.prismaService.car.findMany({
      include: {
        pricing: true,
      },
    });

    const availableCars = cars.filter((car) => {
      const booked = bookedCar.get(car.id) || 0;
      return car.stock > booked;
    });

    const result = availableCars.map((car) => {
      const { avgPricePerDay, totalPrice } = calculateTotalPricePerDay({
        car,
        startDate,
        endDate,
      });

      return {
        id: car.id,
        stock: car.stock,
        brand: car.brand,
        model: car.model,
        availableStock: car.stock - (bookedCar.get(car.id) || 0),
        avgPricePerDay,
        totalPrice,
      };
    });

    return result;
  }

  async getCarById(id: string, { startDate, endDate }: GetCarByIdRequest) {
    const car = await this.prismaService.car.findUnique({
      where: { id },
      include: {
        pricing: true,
      },
    });

    if (!car) {
      throw new Error(`Car with ID ${id} not found`);
    }

    let avgPricePerDay: number | null = null;
    let totalPrice: number | null = null;
    let availableCar: number | null = null;

    if (startDate && endDate) {
      const { avgPricePerDay: avg, totalPrice: total } =
        calculateTotalPricePerDay({
          car,
          startDate: utc(startDate).toDate(),
          endDate: utc(endDate).toDate(),
        });
      avgPricePerDay = avg;
      totalPrice = total;

      const bookedCarCount = await this.getBookedCarCountByDate({
        startDate,
        endDate,
        carId: id,
      });

      availableCar = car.stock - (bookedCarCount.get(id) || 0);
    }

    return {
      id: car.id,
      stock: car.stock,
      brand: car.brand,
      model: car.model,
      pricing: car.pricing,
      availableCar,
      avgPricePerDay,
      totalPrice,
    };
  }

  async getBookedCarCountByDate({
    startDate,
    endDate,
    carId,
  }: {
    startDate: string;
    endDate: string;
    carId?: string;
  }) {
    const bookings = await this.prismaService.booking.groupBy({
      by: ['carId'],
      _count: true,
      where: {
        carId,
        OR: [
          {
            startDate: {
              gte: utc(startDate).toDate(),
              lte: utc(endDate).toDate(),
            },
          },
          {
            endDate: {
              gte: utc(startDate).toDate(),
              lte: utc(endDate).toDate(),
            },
          },
        ],
      },
    });

    const bookingMap = new Map(
      bookings.map((booking) => [booking.carId, booking._count]),
    );

    return bookingMap;
  }
}
