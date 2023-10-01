import { prisma } from '@/config';

async function getHotels() {
  return prisma.hotel.findMany();
}

async function getHotelById(id: number) {
    return prisma.hotel.findUnique({
        where:{
            id
        }
    })
  }

async function getHotelRooms(id: number) {
    return prisma.hotel.findUnique({
        where:{
            id
        },
        include:{
            Rooms: true,
        }
    })
    
}

export const hotelsRepository = {
  getHotels,
  getHotelById,
  getHotelRooms
};