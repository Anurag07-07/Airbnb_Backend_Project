import { serverConfig } from "../config"
import transporter from "../config/mailer.config"
import { InternalServerError } from "../utils/errors/app.error"

export async function sendEmail(to:string,subject:string,body:string) {
    try{
        await transporter.sendMail({
            from:serverConfig.MAIL_USER,
            to,
            subject,
            html:body
        })
    }catch(error){
        throw new InternalServerError(`Failed to send email`)
    }
}