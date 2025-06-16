import { Test, TestingModule } from '@nestjs/testing';
import { CarController } from './car.controller';
import { CarService } from './car.service';
import { ViewAvailabilityRequest } from './dto/ViewAvailabilityRequest.dto';
import { GetCarByIdRequest } from './dto/GetCarByIdRequest.dto';

describe('CarController', () => {
  let controller: CarController;
  let carService: CarService;

  const mockCarService = {
    viewAvailability: jest.fn(),
    getCarById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CarController],
      providers: [
        {
          provide: CarService,
          useValue: mockCarService,
        },
      ],
    }).compile();

    controller = module.get<CarController>(CarController);
    carService = module.get<CarService>(CarService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('viewAvailability', () => {
    it('should call carService.viewAvailability with DTO', async () => {
      const dto: ViewAvailabilityRequest = {
        startDate: '2025-01-01',
        endDate: '2025-01-03',
      };

      const mockResult = [{ id: 'car-123', availableStock: 2 }];
      mockCarService.viewAvailability.mockResolvedValue(mockResult);

      const result = await controller.viewAvailability(dto);

      expect(result).toBe(mockResult);
      expect(carService.viewAvailability).toHaveBeenCalledWith(dto);
    });
  });

  describe('getCarById', () => {
    it('should call carService.getCarById with id and DTO', async () => {
      const id = 'car-123';
      const dto: GetCarByIdRequest = {
        startDate: '2025-01-01',
        endDate: '2025-01-03',
      };

      const mockCar = { id, model: 'Tesla Model Y', stock: 5 };
      mockCarService.getCarById.mockResolvedValue(mockCar);

      const result = await controller.getCarById(id, dto);

      expect(result).toBe(mockCar);
      expect(carService.getCarById).toHaveBeenCalledWith(id, dto);
    });

    it('should call getCarById even if no dates provided', async () => {
      const id = 'car-999';
      const dto: GetCarByIdRequest = {}; // No startDate or endDate

      mockCarService.getCarById.mockResolvedValue({ id });

      const result = await controller.getCarById(id, dto);

      expect(result).toEqual({ id });
      expect(carService.getCarById).toHaveBeenCalledWith(id, dto);
    });
  });
});
