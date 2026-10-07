import { Job, Worker } from "bullmq";
import { NotificationDTO } from "../dto/notification.dto";
import { MAILER_QUEUE } from "../queues/mailer.queue";
import { getRedisConnObject } from "../config/redis.config";
import { MAILER_PAYLOAD } from "../producers/email.producer";
import logger from "../config/logger.config";
import { sendEmail } from "../services/mailer.service";
import { renderMailTemplete } from "../templetes/templetes.handler";

export const setupMailerWorker = ()=>{
        const emailProcessor = new Worker<NotificationDTO>(
        MAILER_QUEUE, //Name of the Queue
        async(job:Job)=>{
            if (job.name !== MAILER_PAYLOAD) {
                throw new Error("Invalid job name")
            }

            //call the service layer
            const payload = job.data
            const emailContent =  await renderMailTemplete(payload.templeteId,payload.params)
            
            await sendEmail(payload.id,payload.subject,emailContent)

            logger.info(`Email sent to ${payload.to} with subject "${payload.subject}"`)

        }, //Process Function
        {
            connection:getRedisConnObject()
        }
    )

    emailProcessor.on("failed",()=>{
        console.log(`Email processing failed`);
    })

    emailProcessor.on("completed",()=>{
        console.log(`Email processing completed successfully`);
    })
}

