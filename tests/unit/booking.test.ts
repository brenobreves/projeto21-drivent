import { notFoundError } from "@/errors"
import { bookingRepository, enrollmentRepository } from "@/repositories"
import { roomRepository } from "@/repositories/rooms-repository"
import { bookingService } from "@/services"

describe('getBooking on bookingServices', () => {
    
    it('should return a notFoundError if the user doesnt have a booking', () => {
        jest.spyOn(bookingRepository, 'getBooking').mockImplementationOnce(():null => {
            return null
        })
        
        const result = bookingService.getBooking(0)

        expect(result).rejects.toEqual(notFoundError())
    })

    it('should return user booking info if everything is correct', () => {
        jest.spyOn(bookingRepository, 'getBooking').mockImplementationOnce((): any => {
            const booking = {
                id:"fake",
                Room : {}
            }
            return booking
        })

        const result = bookingService.getBooking(0)

        expect(result).resolves.toStrictEqual({id:"fake",Room :{}
        })
    })
})

describe('createBooking on bookingServices', () => {
    
    it('should return a not found error if the user enrollment/ticket is not found', () => {
        jest.spyOn(enrollmentRepository, 'findWithTicketByUserId').mockImplementationOnce((): any => {
            return null
        })

        const result = bookingService.createBooking(1,1)

        expect(result).rejects.toEqual(notFoundError())
    })

    it('should return a forbiden error if the ticket isnt paid yet', () => {
        jest.spyOn(enrollmentRepository, 'findWithTicketByUserId').mockImplementationOnce(():any => {
            return {
                Ticket: {
                    status:"Fake"
                }
            }
        })

        const result = bookingService.createBooking(1,1)

        expect(result).rejects.toEqual({name: "Forbidden", message:"Your ticket must be paid, not remote and include hotel"})
    })
    
    it('should return a forbiden error if the ticket is remote', () => {
        jest.spyOn(enrollmentRepository, 'findWithTicketByUserId').mockImplementationOnce(():any => {
            return {
                Ticket: {
                    status:"PAID",
                    TicketType:{
                        isRemote: true
                    }
                }
            }
        })

        const result = bookingService.createBooking(1,1)

        expect(result).rejects.toEqual({name: "Forbidden", message:"Your ticket must be paid, not remote and include hotel"})
    })

    it('should return a forbiden error if the ticket doesnt include hotel', () => {
        jest.spyOn(enrollmentRepository, 'findWithTicketByUserId').mockImplementationOnce(():any => {
            return {
                Ticket: {
                    status:"PAID",
                    TicketType:{
                        isRemote: false,
                        includesHotel: false
                    }
                }
            }
        })

        const result = bookingService.createBooking(1,1)

        expect(result).rejects.toEqual({name: "Forbidden", message:"Your ticket must be paid, not remote and include hotel"})
    })

    it('should return a forbiden error if the room doesnt exist', () => {
        jest.spyOn(enrollmentRepository, 'findWithTicketByUserId').mockImplementationOnce(():any => {
            return {
                Ticket: {
                    status:"PAID",
                    TicketType:{
                        isRemote: false,
                        includesHotel: true
                    }
                }
            }
        })

        jest.spyOn(roomRepository, 'getRoom').mockImplementationOnce((): any => {
            return null
        })

        const result = bookingService.createBooking(1,1)

        expect(result).rejects.toEqual(notFoundError())
    })

    it('should return a forbiden error if the room is full', () => {
        jest.spyOn(enrollmentRepository, 'findWithTicketByUserId').mockImplementationOnce(():any => {
            return {
                Ticket: {
                    status:"PAID",
                    TicketType:{
                        isRemote: false,
                        includesHotel: true
                    }
                }
            }
        })

        jest.spyOn(roomRepository, 'getRoom').mockImplementationOnce((): any => {
            return {
                capacity:1,
                Booking:[{}]
            }
        })

        const result = bookingService.createBooking(1,1)

        expect(result).rejects.toEqual({name: "Forbidden", message:"Room is already full"})
    })

    it('should return the booking id if everything is ok', () => {
        jest.spyOn(enrollmentRepository, 'findWithTicketByUserId').mockImplementationOnce(():any => {
            return {
                Ticket: {
                    status:"PAID",
                    TicketType:{
                        isRemote: false,
                        includesHotel: true
                    }
                }
            }
        })

        jest.spyOn(roomRepository, 'getRoom').mockImplementationOnce((): any => {
            return {
                capacity:10,
                Booking:[{}]
            }
        })

        jest.spyOn(bookingRepository, 'createBooking').mockImplementationOnce((): any => {
            return {id:"Sucesso"}
        })

        const result = bookingService.createBooking(1,1)

        expect(result).resolves.toEqual("Sucesso")
    })
})

describe('updateBooking on bookingServices', () => {

    it('should return a forbidden error if the user doesnt have a booking', () => {
        jest.spyOn(bookingRepository, 'getBooking').mockImplementationOnce(():any => {
            return null
        })

        const result = bookingService.updateBooking(1,1)

        expect(result).rejects.toEqual({name: "Forbidden", message:"Booking not found"})
    })

    it('should return a not found error if the room doesnt exist', () => {
        jest.spyOn(bookingRepository, 'getBooking').mockImplementationOnce(():any => {
            return 1
        })

        jest.spyOn(roomRepository, 'getRoom').mockImplementationOnce((): any => {
            return null
        })

        const result = bookingService.updateBooking(1,1)

        expect(result).rejects.toEqual(notFoundError())
    })

    it('should return a forbidden error if the room is full', () => {
        jest.spyOn(bookingRepository, 'getBooking').mockImplementationOnce(():any => {
            return 1
        })

        jest.spyOn(roomRepository, 'getRoom').mockImplementationOnce((): any => {
            return {
                capacity:1,
                Booking:[{}]
            }
        })

        const result = bookingService.updateBooking(1,1)

        expect(result).rejects.toEqual({name: "Forbidden", message:"New room is full"})
    })

    it('should return the booking id if everythin is ok', () => {
        jest.spyOn(bookingRepository, 'getBooking').mockImplementationOnce(():any => {
            return 1
        })

        jest.spyOn(roomRepository, 'getRoom').mockImplementationOnce((): any => {
            return {
                capacity:10,
                Booking:[{}]
            }
        })

        jest.spyOn(bookingRepository, 'updateBooking').mockImplementationOnce((): any => {
            return{
                id:'Sucesso'
            }
        })

        const result = bookingService.updateBooking(1,1)

        expect(result).resolves.toEqual('Sucesso')
    })
    
})