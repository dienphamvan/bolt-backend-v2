import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CarService } from 'src/car/car.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CustomerService } from './customer.service';
import { BookingRequest } from './dto/BookingRequest.dto';
import { Season } from '@prisma/client';
import { getSeasonForDate } from 'src/common/utils/getSeasonForDate';

jest.mock('src/common/utils/getSeasonForDate', () => ({
  getSeasonForDate: jest.fn(),
}));

describe('CustomerService', () => {
  let service: CustomerService;
  let prisma: jest.Mocked<PrismaService>;
  let carService: jest.Mocked<CarService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              upsert: jest.fn(),
            },
            license: {
              upsert: jest.fn(),
            },
            booking: {
              findFirst: jest.fn(),
              create: jest.fn(),
            },
            car: {
              findFirst: jest.fn(),
            },
          },
        },
        {
          provide: CarService,
          useValue: {
            getBookedCarCountByDate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
    prisma = module.get(PrismaService);
    carService = module.get(CarService);
  });

  it('should create a booking successfully', async () => {
    const dto: BookingRequest = {
      email: 'john@example.com',
      name: 'John Doe',
      licenseNumber: 'ABC123',
      licenseValidUntil: '2025-12-31',
      carId: 'car-id-1',
      startDate: '2025-06-10', // Peak Season
      endDate: '2025-06-12',
    };

    const getSeasonForDateMock = getSeasonForDate as jest.Mock;
    getSeasonForDateMock.mockReturnValue(Season.PEAK);

    const mockUser = { id: 'user-id-1' };
    (prisma.user.upsert as jest.Mock).mockResolvedValue(mockUser);
    (prisma.license.upsert as jest.Mock).mockResolvedValue({});
    (prisma.booking.findFirst as jest.Mock).mockResolvedValue(null);

    (carService.getBookedCarCountByDate as jest.Mock).mockResolvedValue(
      new Map(),
    );

    const mockCar = {
      id: 'car-id-1',
      stock: 2,
      pricing: [
        {
          season: Season.PEAK,
          price: 100,
        },
      ],
    };
    (prisma.car.findFirst as jest.Mock).mockResolvedValue(mockCar);

    (prisma.booking.create as jest.Mock).mockResolvedValue({
      id: 'booking-id-1',
      ...dto,
      userId: mockUser.id,
      totalPrice: 300,
    });

    const result = await service.createBooking(dto);

    expect(result).toMatchObject({
      id: 'booking-id-1',
      userId: mockUser.id,
      carId: dto.carId,
      totalPrice: 300,
    });

    expect(getSeasonForDateMock).toHaveBeenCalled();
    expect(prisma.booking.create).toHaveBeenCalled();
  });

  // it('should create a booking successfully', async () => {
  //   const dto: BookingRequest = {
  //     email: 'test@example.com',
  //     name: 'John Doe',
  //     licenseNumber: '1234',
  //     licenseValidUntil: '2030-01-01',
  //     startDate: '2025-06-20',
  //     endDate: '2025-06-22',
  //     carId: 'car-1',
  //   };

  //   const user = { id: 'user-1' };
  //   const car = {
  //     id: 'car-id-1',
  //     stock: 2,
  //     pricing: [
  //       {
  //         season: Season.PEAK,
  //         price: 100,
  //       },
  //     ],
  //   };

  //   (prisma.user.upsert as jest.Mock).mockResolvedValue(user);
  //   (prisma.license.upsert as jest.Mock).mockResolvedValue({});
  //   (prisma.booking.findFirst as jest.Mock).mockResolvedValue(null);
  //   (carService.getBookedCarCountByDate as jest.Mock).mockResolvedValue(
  //     new Map(),
  //   );
  //   (prisma.car.findFirst as jest.Mock).mockResolvedValue(car);
  //   (prisma.booking.create as jest.Mock).mockResolvedValue({ id: 'booking-1' });

  //   const result = await service.createBooking(dto);

  //   expect(result).toEqual({ id: 'booking-1' });
  //   expect(prisma.user.upsert).toHaveBeenCalled();
  //   expect(prisma.license.upsert).toHaveBeenCalled();
  //   expect(prisma.booking.create).toHaveBeenCalled();
  // });

  it('should throw if overlapping booking found', async () => {
    (prisma.user.upsert as jest.Mock).mockResolvedValue({ id: 'user-1' });
    (prisma.license.upsert as jest.Mock).mockResolvedValue({});
    (prisma.booking.findFirst as jest.Mock).mockResolvedValue({
      id: 'overlap',
    });

    await expect(
      service.createBooking({
        email: 'a',
        name: 'a',
        licenseNumber: 'a',
        licenseValidUntil: '2030-01-01',
        startDate: '2025-06-01',
        endDate: '2025-06-03',
        carId: 'car-1',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw if car not found', async () => {
    (prisma.user.upsert as jest.Mock).mockResolvedValue({ id: 'user-1' });
    (prisma.license.upsert as jest.Mock).mockResolvedValue({});
    (prisma.booking.findFirst as jest.Mock).mockResolvedValue(null);
    (carService.getBookedCarCountByDate as jest.Mock).mockResolvedValue(
      new Map(),
    );
    (prisma.car.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(
      service.createBooking({
        email: 'a',
        name: 'a',
        licenseNumber: 'a',
        licenseValidUntil: '2030-01-01',
        startDate: '2025-06-01',
        endDate: '2025-06-03',
        carId: 'car-1',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw if car is fully booked', async () => {
    (prisma.user.upsert as jest.Mock).mockResolvedValue({ id: 'user-1' });
    (prisma.license.upsert as jest.Mock).mockResolvedValue({});
    (prisma.booking.findFirst as jest.Mock).mockResolvedValue(null);
    (carService.getBookedCarCountByDate as jest.Mock).mockResolvedValue(
      new Map([['car-1', 5]]),
    );
    (prisma.car.findFirst as jest.Mock).mockResolvedValue({
      id: 'car-1',
      stock: 5,
      pricing: [],
    });

    await expect(
      service.createBooking({
        email: 'a',
        name: 'a',
        licenseNumber: 'a',
        licenseValidUntil: '2030-01-01',
        startDate: '2025-06-01',
        endDate: '2025-06-03',
        carId: 'car-1',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
