import supertest from "supertest";
import httpStatus from "http-status";
import faker from "@faker-js/faker";
import * as jwt from 'jsonwebtoken';
import { createBooking } from "../factories/booking-factory";
