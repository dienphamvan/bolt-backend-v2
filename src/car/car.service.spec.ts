import { Test, TestingModule } from '@nestjs/testing';
import { CarService } from './car.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { calculateTotalPricePerDay } from 'src/common/utils/calculateTotalPricePerDay';
import { utc } from 'moment';

jest.mock('../../src/common/utils/calculateTotalPricePerDay');

describe('CarService', () => {
  let service: CarService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarService,
        {
          provide: PrismaService,
          useValue: {
            car: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
            booking: {
              groupBy: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CarService>(CarService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('viewAvailability', () => {
    it('should return available cars with pricing info', async () => {
      const mockCars = [
        {
          id: 'car1',
          stock: 5,
          brand: 'Toyota',
          model: 'Camry',
          pricing: [],
        },
      ];
      const mockBookingMap = new Map([['car1', 2]]);

      (service['getBookedCarCountByDate'] as jest.Mock) = jest
        .fn()
        .mockResolvedValue(mockBookingMap);

      jest
        .spyOn(prismaService.car, 'findMany')
        .mockResolvedValue(mockCars as any);

      (calculateTotalPricePerDay as jest.Mock).mockReturnValue({
        avgPricePerDay: 100,
        totalPrice: 300,
      });

      const result = await service.viewAvailability({
        startDate: '2025-06-15',
        endDate: '2025-06-17',
      });

      expect(result).toEqual([
        {
          id: 'car1',
          stock: 5,
          brand: 'Toyota',
          model: 'Camry',
          availableStock: 3,
          avgPricePerDay: 100,
          totalPrice: 300,
        },
      ]);
    });
  });

  describe('getCarById', () => {
    it('should return car info with availability and pricing', async () => {
      const mockCar = {
        id: 'car1',
        stock: 5,
        brand: 'Toyota',
        model: 'Camry',
        pricing: [],
      };

      jest
        .spyOn(prismaService.car, 'findUnique')
        .mockResolvedValue(mockCar as any);

      (calculateTotalPricePerDay as jest.Mock).mockReturnValue({
        avgPricePerDay: 100,
        totalPrice: 300,
      });

      const mockBookingMap = new Map([['car1', 2]]);
      (service['getBookedCarCountByDate'] as jest.Mock) = jest
        .fn()
        .mockResolvedValue(mockBookingMap);

      const result = await service.getCarById('car1', {
        startDate: '2025-06-15',
        endDate: '2025-06-17',
      });

      expect(result).toEqual({
        id: 'car1',
        stock: 5,
        brand: 'Toyota',
        model: 'Camry',
        pricing: [],
        availableCar: 3,
        avgPricePerDay: 100,
        totalPrice: 300,
      });
    });

    it('should throw error if car not found', async () => {
      jest.spyOn(prismaService.car, 'findUnique').mockResolvedValue(null);

      await expect(
        service.getCarById('car2', {
          startDate: '2025-06-15',
          endDate: '2025-06-17',
        }),
      ).rejects.toThrowError('Car with ID car2 not found');
    });
  });

  describe('getBookedCarCountByDate', () => {
    it('should return a booking map from grouped bookings', async () => {
      const groupedBookings = [
        {
          carId: 'car1',
          _count: 3,
        },
        {
          carId: 'car2',
          _count: 1,
        },
      ];

      jest
        .spyOn(prismaService.booking, 'groupBy')
        .mockResolvedValue(groupedBookings as any);

      const result = await service.getBookedCarCountByDate({
        startDate: '2025-06-15',
        endDate: '2025-06-17',
      });

      expect(result).toEqual(
        new Map([
          ['car1', 3],
          ['car2', 1],
        ]),
      );
    });
  });
});
