import { Test, TestingModule } from '@nestjs/testing';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { BookingRequest } from './dto/BookingRequest.dto';

describe('CustomerController', () => {
  let customerController: CustomerController;
  let customerService: CustomerService;

  beforeEach(async () => {
    const mockCustomerService = {
      createBooking: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerController],
      providers: [
        {
          provide: CustomerService,
          useValue: mockCustomerService,
        },
      ],
    }).compile();

    customerController = module.get<CustomerController>(CustomerController);
    customerService = module.get<CustomerService>(CustomerService);
  });

  it('should be defined', () => {
    expect(customerController).toBeDefined();
  });

  it('should call customerService.createBooking with the correct dto', async () => {
    const dto: BookingRequest = {
      email: 'john@example.com',
      name: 'John Doe',
      licenseNumber: 'ABC123',
      licenseValidUntil: '2025-12-31',
      carId: 'car-id-1',
      startDate: '2025-06-10',
      endDate: '2025-06-12',
    };

    const mockBooking = {
      id: 'booking-id-1',
      ...dto,
      userId: 'user-id-1',
      totalPrice: 300,
    };

    (customerService.createBooking as jest.Mock).mockResolvedValue(mockBooking);

    const result = await customerController.createBooking(dto);

    expect(customerService.createBooking).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mockBooking);
  });
});
