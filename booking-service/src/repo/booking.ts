import { prisma } from "../prisma/client";
import {  IdempotencyKey, Prisma } from "../prisma/generated/prisma/client";
import { validate as isValidUUID } from "uuid";
import { BadRequestError, NotFoundError } from "../utils/errors/app.error";
export async function createBooking(bookingInput:Prisma.BookingCreateInput) {
    const booking = await prisma.booking.create({
        data:bookingInput
    })
    return booking;
}

export async function createIdempotencyKey(key:string,bookingId:number) {
    const idempotencyKey = await prisma.idempotencyKey.create({
        data:{
            idemkey:key,
            booking:{
                connect:{
                    id:bookingId
                }
            }
        }
    })
    return idempotencyKey   
}

export async function getIdempotencyKeyWithLock(key:string,tx:Prisma.TransactionClient) {

    if (isValidUUID(key)) {
        throw new BadRequestError(`Invalid idempotency key format`)
    }

    const idempotencyKey:Array<IdempotencyKey> = await tx.$queryRaw(
        Prisma.raw(` SELECT * FROM IdempotencyKey WHERE "idemkey" = ${key} FOR UPDATE; `)
    )

    console.log(`Idempotency key with lock ${idempotencyKey}`);
    
    if (!idempotencyKey || idempotencyKey.length===0) {
        throw new NotFoundError(`Idempotency Key Not Found`)
    }

    return idempotencyKey[0]
}

export async function getBookingId(bookingId:number) {
    const booking = await prisma.booking.findUnique({
        where:{
            id:bookingId
        }
    })

    return booking
}

// export async function changeBookingStatus(bookingId:number,status:EnumBookingStatusFieldUpdateOperationsInput){
//     const booking = await prisma.booking.update({
//         where:{
//             id:bookingId
//         },
//         data:{
//             status:status
//         }
//     })

//     return booking
// }

export async function confirmBooking(bookingId:number,tx:Prisma.TransactionClient) {
    const booking = await tx.booking.update({
        where:{
            id:bookingId
        },
        data:{
            status:"CONFIRMED"
        }
    })

    return booking;
}

export async function cancelBooking(bookingId:number) {
    const booking = await prisma.booking.update({
        where:{
            id:bookingId
        },
        data:{
            status:"CANCELLED"
        }
    })

    return booking;
}

export async function finalizeIdempotencyKey(tx:Prisma.TransactionClient,key:string) {
    const idempotencyKey = await tx.idempotencyKey.update({
        where:{
            idemkey:key 
        },
        data:{
            finalized:true
        }
    })

    return idempotencyKey;
}