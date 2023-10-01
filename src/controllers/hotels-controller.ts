import { invalidDataError } from "@/errors";
import { AuthenticatedRequest } from "@/middlewares";
import { hotelsService } from "@/services/hotels-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getHotels(req:AuthenticatedRequest, res:Response) {
    await hotelsService.checkEnrollment(req.userId)
    const hotels = await hotelsService.getHotels()
    res.status(httpStatus.OK).send(hotels)
}

export async function getRooms(req:AuthenticatedRequest, res:Response) {
    const {hotelId} = req.params
    if(isNaN(Number(hotelId))) throw invalidDataError("params hotelId")
    await hotelsService.checkEnrollment(req.userId)
    await hotelsService.checkHotel(Number(hotelId))
    const hotelRooms = await hotelsService.getRooms(Number(hotelId))
    res.status(httpStatus.OK).send(hotelRooms)
}