import { BadRequestException } from '@nestjs/common';
import { Car, SeasonalPricing } from '@prisma/client';
import { utc } from 'moment';
import { getSeasonForDate } from 'src/common/utils/getSeasonForDate';

export function calculateTotalPricePerDay({
  car,
  startDate,
  endDate,
}: {
  car: Car & { pricing: SeasonalPricing[] };
  startDate: string | Date;
  endDate: string | Date;
}) {
  let totalPrice = 0;

  const numberOfDays = utc(endDate).diff(utc(startDate), 'days') + 1;

  const startMoment = utc(startDate);
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
