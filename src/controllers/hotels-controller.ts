import { invalidDataError } from "@/errors";
import { AuthenticatedRequest } from "@/middlewares";
import { hotelsService } from "@/services/hotels-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getHotels(req:AuthenticatedRequest, res:Response) {
    const hotels = await hotelsService.getHotels(req.userId)
    res.status(httpStatus.OK).send(hotels)
}

export async function getRooms(req:AuthenticatedRequest, res:Response) {
    const {hotelId} = req.params
    if(isNaN(Number(hotelId))) throw invalidDataError("params hotelId")
    const hotelRooms = await hotelsService.getRooms(Number(hotelId), req.userId)
    res.status(httpStatus.OK).send(hotelRooms)
}