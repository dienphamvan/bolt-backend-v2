import { PrismaClient, Season } from '@prisma/client';

const prisma = new PrismaClient();
const main = async () => {
  try {
    const cars = await Promise.all([
      prisma.car.create({
        data: {
          brand: 'Toyota',
          model: 'Yaris',
          stock: 3,
          pricing: {
            createMany: {
              data: [
                { price: 98.43, season: Season.PEAK },
                { price: 76.89, season: Season.MID },
                { price: 53.65, season: Season.OFF },
              ],
            },
          },
        },
      }),

      prisma.car.create({
        data: {
          brand: 'Seat',
          model: 'Ibiza',
          stock: 5,
          pricing: {
            createMany: {
              data: [
                { price: 85.12, season: Season.PEAK },
                { price: 65.73, season: Season.MID },
                { price: 46.85, season: Season.OFF },
              ],
            },
          },
        },
      }),

      prisma.car.create({
        data: {
          brand: 'Nissan',
          model: 'Qashqai',
          stock: 2,
          pricing: {
            createMany: {
              data: [
                { price: 101.46, season: Season.PEAK },
                { price: 82.94, season: Season.MID },
                { price: 59.87, season: Season.OFF },
              ],
            },
          },
        },
      }),

      prisma.car.create({
        data: {
          brand: 'Jaguar',
          model: 'e-pace',
          stock: 1,
          pricing: {
            createMany: {
              data: [
                { price: 120.54, season: Season.PEAK },
                { price: 91.35, season: Season.MID },
                { price: 70.27, season: Season.OFF },
              ],
            },
          },
        },
      }),

      prisma.car.create({
        data: {
          brand: 'Mercedes',
          model: 'Vito',
          stock: 2,
          pricing: {
            createMany: {
              data: [
                { price: 109.16, season: Season.PEAK },
                { price: 89.64, season: Season.MID },
                { price: 64.97, season: Season.OFF },
              ],
            },
          },
        },
      }),
    ]);

    console.log('Cars seeded:', cars);
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

main();
