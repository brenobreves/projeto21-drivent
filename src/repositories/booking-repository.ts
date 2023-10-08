import { prisma } from "@/config";

async function getBooking(userId:number) {
    return await prisma.booking.findFirst({
        where:{
            userId,
        },
        select:{
            id: true,
            Room: true,
        }
    })
}

async function createBooking(userId:number, roomId:number) {
    return await prisma.booking.create({
        data:{
            userId,
            roomId
        }
    })
}

async function updateBooking(id:number,roomId:number) {
    return await prisma.booking.update({
        where:{
            id
        },
        data:{
            roomId,
            updatedAt: new Date()
        }
    })
}

export const bookingRepository = { getBooking, createBooking, updateBooking }