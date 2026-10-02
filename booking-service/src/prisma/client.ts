import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "./generated/prisma/client";

const adapter = new PrismaMariaDb({
    host:"localhost",
    user:"root",
    database:"airbnb_booking_dev"
})

export const prisma =  new PrismaClient({adapter});