import { IsDateString, IsOptional } from 'class-validator';
import { IsAfter } from 'src/common/custom-validation/IsAfter';

export class GetCarByIdRequest {
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  @IsAfter('startDate', {
    message: 'End date must be after the start date',
  })
  endDate?: string;
}
