import app, { init } from "@/app"
import { cleanDb, generateValidToken } from "../helpers"
import supertest from "supertest";
import httpStatus from "http-status";
import faker from "@faker-js/faker";
import { createEnrollmentWithAddress, createMyTicketType, createTicket, createTicketType, createUser } from "../factories";
import * as jwt from 'jsonwebtoken';
import { createHotel } from "../factories/hotels-factory";

type ResponseHotel = {
    id: number;
    image: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    Rooms?: ResponseRoom[];
}
type ResponseRoom = {
    id: number;
    name: string;
    capacity: number;
    hotelId: number;
    createdAt: string;
    updatedAt: string;
}

beforeAll(async ()=>{
    await init();
})

beforeEach(async ()=>{
    await cleanDb();
})

const server = supertest(app)

describe('GET /hotels', ()=>{
    it('should respond with status 401 if no token is given', async () => {
        const response = await server.get('/hotels');
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      });
    
    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      });

    it('should respond with status 401 if there is no session for given token', async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      });
    describe('when token is valid',()=>{
        it('should respond with status 404 if there is no enrollment for given user',async ()=>{
            const token = await generateValidToken();
            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(httpStatus.NOT_FOUND);
        })
        it('should respond with status 404 if there is no ticket for given users enrollment',async ()=>{
            const user = await createUser()
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user)
            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(httpStatus.NOT_FOUND);
        })
        it('should respond with status 402 if the ticket for given users enrollment is not paid',async ()=>{
            const user = await createUser()
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user)
            const ticketType = await createMyTicketType(false,true)
            const ticket = await createTicket(enrollment.id,ticketType.id,"RESERVED")
            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
        })
        it('should respond with status 402 if the ticket for given users enrollment is remote',async ()=>{
            const user = await createUser()
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user)
            const ticketType = await createMyTicketType(true,true)
            const ticket = await createTicket(enrollment.id,ticketType.id,"PAID")
            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
        })
        it('should respond with status 402 if the ticket for given users enrollment doesnt include hotel',async ()=>{
            const user = await createUser()
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user)
            const ticketType = await createMyTicketType(false,false)
            const ticket = await createTicket(enrollment.id,ticketType.id,"PAID")
            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
        })
        it('should respond with status 404 when no hotels are found',async ()=>{
            const user = await createUser()
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user)
            const ticketType = await createMyTicketType(false,true)
            const ticket = await createTicket(enrollment.id,ticketType.id,"PAID")
            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(httpStatus.NOT_FOUND);
        })
        it('should respond with status 200 and hotels list when everything is correct',async ()=>{
            const user = await createUser()
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user)
            const ticketType = await createMyTicketType(false,true)
            const ticket = await createTicket(enrollment.id,ticketType.id,"PAID")
            const hotel1 = await createHotel()
            const hotel2 = await createHotel()
            const hotels = [hotel1,hotel2]
            const formatedHotels = hotels.map((hotel) =>{
                const container: ResponseHotel = {
                    id: hotel.id,
                    image: hotel.image,
                    name: hotel.name,
                    createdAt: hotel.createdAt.toISOString(),
                    updatedAt: hotel.updatedAt.toISOString(),
                };
                return container
            })
            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(httpStatus.OK);
            expect(response.body).toHaveLength(2)
            expect(response.body).toStrictEqual(formatedHotels)
        })

    })
})

describe('GET /hotels/:hotelId', ()=>{
    it('should respond with status 401 if no token is given', async () => {
        const response = await server.get('/hotels/1');
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      });
    
    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();

        const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      });

    it('should respond with status 401 if there is no session for given token', async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
        const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      });
    describe('when token is valid',()=>{
        it('should respond with status 404 when the hotel isnt found',async () => {
            const user = await createUser()
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user)
            const ticketType = await createMyTicketType(false,true)
            const ticket = await createTicket(enrollment.id,ticketType.id,"PAID")
            const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(httpStatus.NOT_FOUND);
        })
        it('should respond with status 404 if there is no enrollment for given user',async ()=>{
            const token = await generateValidToken();
            const hotel = await createHotel();
            const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(httpStatus.NOT_FOUND);
        })
        it('should respond with status 404 if there is no ticket for given users enrollment',async ()=>{
            const user = await createUser()
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user)
            const hotel = await createHotel();
            const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(httpStatus.NOT_FOUND);
        })
        it('should respond with status 402 if the ticket for given users enrollment is not paid',async ()=>{
            const user = await createUser()
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user)
            const ticketType = await createMyTicketType(false,true)
            const ticket = await createTicket(enrollment.id,ticketType.id,"RESERVED")
            const hotel = await createHotel();
            const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
        })
        it('should respond with status 402 if the ticket for given users enrollment is remote',async ()=>{
            const user = await createUser()
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user)
            const ticketType = await createMyTicketType(true,true)
            const ticket = await createTicket(enrollment.id,ticketType.id,"PAID")
            const hotel = await createHotel();
            const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
        })
        it('should respond with status 402 if the ticket for given users enrollment doesnt include hotel',async ()=>{
            const user = await createUser()
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user)
            const ticketType = await createMyTicketType(false,false)
            const ticket = await createTicket(enrollment.id,ticketType.id,"PAID")
            const hotel = await createHotel();
            const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
        })
        it('should respond with status 200 and the hotel info with rooms list if everything is correct',async ()=>{
            const user = await createUser()
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user)
            const ticketType = await createMyTicketType(false,true)
            const ticket = await createTicket(enrollment.id,ticketType.id,"PAID")
            const hotel = await createHotel();
            const formatedRooms = hotel.Rooms.map(room => {
                const container: ResponseRoom = {
                    id: room.id,
                    capacity: room.capacity,
                    name: room.name,
                    hotelId: room.hotelId,
                    createdAt: room.createdAt.toISOString(),
                    updatedAt: room.updatedAt.toISOString(),
                }
                return container
            })
            const formatedHotel: ResponseHotel = {
                id: hotel.id,
                image: hotel.image,
                name: hotel.name,
                createdAt: hotel.createdAt.toISOString(),
                updatedAt: hotel.updatedAt.toISOString(),
                Rooms:formatedRooms
            }
            const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(httpStatus.OK);
            expect(response.body).toStrictEqual(formatedHotel)
        })
    })
})