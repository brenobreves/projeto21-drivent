import { Response } from "express";
import { AuthenticatedRequest } from '@/middlewares';
import httpStatus from 'http-status';
import { bookingService } from "@/services/booking-service";

export async function getBooking(req: AuthenticatedRequest, res:Response) {
    const booking = await bookingService.getBooking(req.userId)
    res.status(httpStatus.OK).send(booking)
}

export async function createBooking(req: AuthenticatedRequest, res:Response) {
    const {roomId} = req.body
    const booking = await bookingService.createBooking(req.userId, roomId)
    res.status(httpStatus.OK).send({bookingId:booking})
}

export async function updateBooking(req: AuthenticatedRequest, res:Response) {
    const {roomId} = req.body
    const booking = await bookingService.updateBooking(req.userId, roomId)
    res.status(httpStatus.OK).send({bookingId:booking})
}