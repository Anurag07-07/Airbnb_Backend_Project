import { serverConfig } from ".";
import IORedis, { Redis } from 'ioredis';
import Redlock from 'redlock';

// const redisClient = new IORedis(serverConfig.REDIS_SERVER_URL) as any;

function connectToRedis(){
    try {
        let connection:Redis;
        //Singleton Object
        return ()=>{
            if (!connection) {
                connection = new IORedis(serverConfig.REDIS_SERVER_URL)
                return connection
            }
            return connection
        }
    } catch (error) {
        console.log(`Error connecting to Redis: ${error}`);
        throw error
    }
}

export const getRedisConnObject = connectToRedis()

export const redlock = new Redlock([getRedisConnObject() as any], {
  driftFactor: 0.01,
  retryCount: 10,
  retryDelay: 200,
  retryJitter: 200,
});