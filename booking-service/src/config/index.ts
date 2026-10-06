// This file contains all the basic configuration logic for the app server to work
import dotenv from 'dotenv';

type ServerConfig = {
    PORT: number
    REDIS_SERVER_URL:string
    REDLOCK_TTL:number
}

function loadEnv() {
    dotenv.config();
    console.log(`Environment variables loaded`);
}

loadEnv();

export const serverConfig: ServerConfig = {
    PORT: Number(process.env.PORT) || 3001,
    REDIS_SERVER_URL:process.env.REDIS_SERVER_URL || `redis://localhost:6379`,
    REDLOCK_TTL:Number(process.env.REDLOCK_TTL) || 5000
};