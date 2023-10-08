import supertest from "supertest";
import httpStatus from "http-status";
import faker from "@faker-js/faker";
import * as jwt from 'jsonwebtoken';
import { createBooking } from "../factories/booking-factory";
import { cleanDb, generateValidToken } from "../helpers";
import { prisma } from "@/config";
import app, {init} from "@/app";
import { createUser } from "../factories";
import { createHotel, createRoomWithHotelId } from "../factories/hotels-factory";

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
        it('should respond with status 404 if there is no booking for given user', async () => {
            const user = await createUser()
            const token = await generateValidToken(user)

            const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

            expect(response.status).toEqual(httpStatus.NOT_FOUND);
        })

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