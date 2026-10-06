import { CreateBookingDTO } from "../DTO/booking.dto";
import { generateIdempotencyKey } from "../helpers/generateIdempotencyKey";
import { prisma } from "../prisma/client";
import { confirmBooking, createBooking, createIdempotencyKey, finalizeIdempotencyKey, getIdempotencyKeyWithLock } from "../repo/booking";
import { BadRequestError, NotFoundError } from "../utils/errors/app.error";

export async function createBookingService(
    createBookingDTO:CreateBookingDTO
) {
    const booking = await createBooking({
        userId:createBookingDTO.userId,
        hotelId:createBookingDTO.hotelId,
        totalGuests:createBookingDTO.totalGuests,
        bookingAmount:createBookingDTO.bookingAmount
    })

    const idempotencyKey = generateIdempotencyKey();

    await createIdempotencyKey(idempotencyKey,booking.id)
    return {
        bookingId:booking.id,
        idempotencyKey:idempotencyKey
    };
}
//Problem is what if the two request comes parellely
//One request get idem key and context switch happen 
//Another req also get idem key and booking confirmed 
//Now When Conext Switch again happen idem key is there so how to handle that situation

// export async function confirmBookingService(idempotencyKey:string) {
//     const idempotencyKeyData = await getIdempotencyKey(idempotencyKey)

//     if (!idempotencyKeyData) {
//         throw new NotFoundError(`Idempotency key Not Found`)
//     }

//     if (idempotencyKeyData.finalized){
//         throw new BadRequestError(`Idempotency key not Found`)
//     }

//     const booking = await confirmBooking(idempotencyKeyData.bookingId)
//     await finalizeIdempotencyKey(idempotencyKey)

//     return booking
// }

export async function confirmBookingService(idempotencyKey:string) {
    //We put lock when we get idem key to solve this issue
    return await prisma.$transaction(async(tx)=>{
        const idempotencyKeyData = await getIdempotencyKeyWithLock(idempotencyKey,tx)

        if (!idempotencyKeyData) {
            throw new NotFoundError(`Idempotency key Not Found`)
        }

        if (idempotencyKeyData.finalized){
            throw new BadRequestError(`Idempotency key not Found`)
        }

        const booking = await confirmBooking(idempotencyKeyData.bookingId,tx)
        await finalizeIdempotencyKey(tx,idempotencyKey)

        return booking
    })
    
}