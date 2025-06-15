/*
Peak: June 1 – Sept 15

Mid: Sept 16 – Oct 31, Mar 1 – May 31

Off: Nov 1 – Feb 28
*/

import * as moment from 'moment';
import { Season } from '@prisma/client';

export function getSeasonForDate(date: Date): Season {
  const m = moment.utc(date);
  const md = (m.month() + 1) * 100 + m.date();

  // Convert month and date to a single number in the format MMDD

  if (md >= 601 && md <= 915) return Season.PEAK;
  if ((md >= 916 && md <= 1031) || (md >= 301 && md <= 531)) return Season.MID;
  return Season.OFF;
}
