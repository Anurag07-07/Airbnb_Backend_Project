import { prisma } from "../prisma/client";
import { Prisma } from "../prisma/generated/prisma/client";

export async function createBooking(bookingInput:Prisma.BookingCreateInput) {
    const booking = await prisma.booking.create({
        data:bookingInput
    })
    return booking;
}