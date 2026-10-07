import path from 'path'
import fs from 'fs/promises'
import Handlebars from 'handlebars'
import { InternalServerError } from '../utils/errors/app.error'
export async function renderMailTemplete(templeteId:string,params:Record<string,any>):Promise<string>{
    const templetePath = path.join(__dirname,'mailer',`${templeteId}.hbs`)
    try{
        const content = await fs.readFile(templetePath,'utf-8')
        const finalTemplete = Handlebars.compile(content)
        return finalTemplete(params) 
    }catch(error){
        throw new InternalServerError(`Templete not found: ${templeteId}`)
    }
} 