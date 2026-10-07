export interface NotificationDTO{
    to:string; // Email address of recipient
    subject:string; //Subject of the email
    templateId:string; //ID of the email templete to use
    params:Record<string,any> //Parameters to replace in the templete 
}