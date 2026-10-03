import { generateIdempotencyKey } from "../helpers/generateIdempotencyKey";
import { confirmBooking, createBooking, createIdempotencyKey, finalizeIdempotencyKey, getIdempotencyKey } from "../repo/booking";
import { BadRequestError, NotFoundError } from "../utils/errors/app.error";

export async function createBookingService(
    userId:number,
    hotelId:number,
    totalGuests:number,
    Bookingamount:number
) {
    const booking = await createBooking({
        userId,
        hotelId,
        totalGuests:totalGuests,
        bookingAmount:Bookingamount
    })

    const idempotencyKey = generateIdempotencyKey();

    await createIdempotencyKey(idempotencyKey,booking.id)
    return {
        bookingId:booking.id,
        idempotencyKey:idempotencyKey
    };
}

export async function confirmBookingService(idempotencyKey:string) {
    const idempotencyKeyData = await getIdempotencyKey(idempotencyKey)

    if (!idempotencyKeyData) {
        throw new NotFoundError(`Idempotency key Not Found`)
    }

    if (idempotencyKeyData.finalized) {
        throw new BadRequestError(`Idempotency key not Found`)
    }

    const booking = await confirmBooking(idempotencyKeyData.bookingId)
    await finalizeIdempotencyKey(idempotencyKey)

    return booking
}