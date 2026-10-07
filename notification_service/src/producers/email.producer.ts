import { NotificationDTO } from "../dto/notification.dto"
import { mailerQueue } from "../queues/mailer.queue"

export const MAILER_PAYLOAD = "payload:mail"

//Adding email to queue
export const addEmailToQueue = async(payload:NotificationDTO)=>{
    await mailerQueue.add(MAILER_PAYLOAD,payload)
    console.log(`Email added to queue: ${JSON.stringify(payload)}`);
}