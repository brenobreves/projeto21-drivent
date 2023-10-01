import { notFoundError } from "@/errors"
import { enrollmentRepository, hotelsRepository } from "@/repositories"

async function checkEnrollment(userId:number) {
    const enrollment = await enrollmentRepository.findWithTicketByUserId(userId);
    console.log(enrollment);
    if(!enrollment || !enrollment.Ticket) throw notFoundError();
    if(enrollment.Ticket.status !== "PAID") throw {name:"PaymentRequired", message: "Ticket is not paid"}
    if(enrollment.Ticket.TicketType.isRemote) throw {name:"PaymentRequired", message: "Ticket is remote"}
    if(!enrollment.Ticket.TicketType.includesHotel) throw {name:"PaymentRequired", message: "Ticket doesn't include hotel"}
}

async function getHotels() {
    const hotels =  await hotelsRepository.getHotels()
    if (hotels.length === 0) throw notFoundError()
    return hotels
}

async function checkHotel(hotelId: number) {
    const hotel = await hotelsRepository.getHotelById(hotelId)
    if(!hotel) throw notFoundError()
}

async function getRooms(hotelId: number) {
    return await hotelsRepository.getHotelRooms(hotelId)
}
export const hotelsService = { checkEnrollment, getHotels, checkHotel, getRooms }