import { IsDateString } from 'class-validator';
import { IsAfter } from 'src/common/custom-validation/IsAfter';

export class ViewAvailabilityRequest {
  @IsDateString()
  startDate: string;

  @IsDateString()
  @IsAfter('startDate', {
    message: 'End date must be after the start date',
  })
  endDate: string;
}
