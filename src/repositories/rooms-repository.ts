import { prisma } from "@/config";

async function getRoom(roomId:number) {
    return await prisma.room.findUnique({
        where:{
            id:roomId
        },
        include:{
            Booking:true
        }
    })
}

export const roomRepository = { getRoom }