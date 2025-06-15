import { IsDateString, IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { IsAfter } from 'src/common/custom-validation/IsAfter';

export class BookingRequest {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  @IsNotEmpty()
  carId: string;

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  @IsAfter('startDate', {
    message: 'End date must be after the start date of the booking.',
  })
  endDate: string;

  @IsString()
  @IsNotEmpty()
  licenseNumber: string;

  @IsString()
  @IsDateString()
  @IsAfter('endDate', {
    message: 'License valid date must be after the end date of the booking.',
  })
  licenseValidUntil: string;
}
