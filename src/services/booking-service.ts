import { notFoundError } from "@/errors";
import { enrollmentRepository } from "@/repositories";
import { bookingRepository } from "@/repositories/booking-repository";
import { roomRepository } from "@/repositories/rooms-repository";

async function getBooking(userId:number) {
    const booking = await bookingRepository.getBooking(userId)
    if (!booking) throw notFoundError()
    return booking
}

async function createBooking(userId:number,roomId:number) {
    const userInfos = await enrollmentRepository.findWithTicketByUserId(userId);
    if(!userInfos) throw notFoundError()
    if (userInfos.Ticket.status !== "PAID" || userInfos.Ticket.TicketType.isRemote || !userInfos.Ticket.TicketType.includesHotel){
        throw {name: "Forbidden", message:"Your ticket must be paid, not remote and include hotel"}
    }
    const roomInfos = await roomRepository.getRoom(roomId)
    if(!roomInfos) throw notFoundError()
    if(roomInfos.capacity <= roomInfos.Booking.length){
        throw {name: "Forbidden", message:"Room is already full"}
    }
    const booking = await bookingRepository.createBooking(userId,roomId)
    return booking.id
}

async function updateBooking(userId:number,roomId:number, bookingId: number) {
    const paramsbooking = await bookingRepository.getBookingById(bookingId)
    if (!paramsbooking) throw notFoundError()
    if (paramsbooking.userId !== userId) throw {name:"Forbidden", message:"User doesnt own this booking"}
    const newRoomInfo = await roomRepository.getRoom(roomId)
    if (!newRoomInfo) throw notFoundError()
    if (newRoomInfo.capacity <= newRoomInfo.Booking.length) throw {name: "Forbidden", message:"New room is full"}
    const newbooking = await bookingRepository.updateBooking(paramsbooking.id,roomId)
    return newbooking.id
}

export const bookingService = { getBooking, createBooking, updateBooking}