import supertest from "supertest";
import httpStatus from "http-status";
import faker from "@faker-js/faker";
import * as jwt from 'jsonwebtoken';
import { createBooking } from "../factories/booking-factory";
import { cleanDb, generateValidToken } from "../helpers";
import { prisma } from "@/config";
import app, {init} from "@/app";
import { createEnrollmentWithAddress, createTicket, createTicketType, createUser } from "../factories";
import { createHotel, createRoomWithHotelId } from "../factories/hotels-factory";
import { number } from "joi";

beforeAll(async () => {
    await init();
  });
  
beforeEach(async () => {
    await cleanDb();
  });
 
const server = supertest(app)

describe('GET /booking', () => {
    
    it('should respond with status 401 if no token is given', async () => {
        const response = await server.get('/booking');
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    
    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();

        const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
        const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe('when token is valid', () => {

        it('should respond with status 200 and booking info if everything is ok', async () => {
            const user = await createUser()
            const token = await generateValidToken(user)
            const hotel = await createHotel()
            const room = await createRoomWithHotelId(hotel.id)
            const booking = await createBooking(user.id,room.id)

            const response = await server.get('/booking').set('Authorization', `Bearer ${token}`)

            const formatedCreated = room.createdAt

            expect(response.status).toEqual(httpStatus.OK);
            expect(response.body).toStrictEqual({
                id: booking.id,
                Room:{
                    id: room.id,
                    name: room.name,
                    capacity: room.capacity,
                    hotelId: room.hotelId,
                    createdAt: room.createdAt.toISOString(),
                    updatedAt: room.updatedAt.toISOString()
                }
            })
        })
    })
})

describe('POST /booking', () => {
    it('should respond with status 401 if no token is given', async () => {
        const response = await server.post('/booking');
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    
    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();

        const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
        const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe('when token is valid', () => {
        it('should respond with status 400 if body doesnt match schema', async () => {
            const user = await createUser()
            const token = await generateValidToken(user)

            const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({})

            expect(response.status).toBe(httpStatus.BAD_REQUEST)
        })

        it('should respond with status 200 and bookingId if everything is correct', async () => {
            const user = await createUser()
            const token = await generateValidToken(user)
            const hotel = await createHotel()
            const room = await createRoomWithHotelId(hotel.id)
            const enrollment = await createEnrollmentWithAddress(user)
            const ticketType = await createTicketType(false,true)
            const ticket = await createTicket(enrollment.id,ticketType.id, "PAID")

            const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({roomId:room.id})

            expect(response.status).toBe(httpStatus.OK)
            expect(response.body).toStrictEqual({
                bookingId: expect.any(Number)
            })
        })
    })
})

describe('PUT /booking/:bookingId', () => {
    it('should respond with status 401 if no token is given', async () => {
        const response = await server.put('/booking/1');
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    
    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();

        const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
        const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe('when token is valid', () => {

        it('should respond with status 400 if body doesnt match schema', async () => {
            const user = await createUser()
            const token = await generateValidToken(user)

            const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`).send({})

            expect(response.status).toBe(httpStatus.BAD_REQUEST)
        })

        it('should respond with status 200 and bookingId if everything is correct', async () => {
            const user = await createUser()
            const token = await generateValidToken(user)
            const hotel = await createHotel()
            const room1 = await createRoomWithHotelId(hotel.id)
            const room2 = await createRoomWithHotelId(hotel.id)
            const enrollment = await createEnrollmentWithAddress(user)
            const ticketType = await createTicketType(false,true)
            const ticket = await createTicket(enrollment.id,ticketType.id, "PAID")
            const booking = await createBooking(user.id,room1.id)

            const response = await server.put(`/booking/${booking.id}`).set('Authorization', `Bearer ${token}`).send({roomId:room2.id})

            expect(response.status).toBe(httpStatus.OK)
            expect(response.body).toStrictEqual({bookingId:booking.id})
        })

    })
})