// create a queue using bullmq
const { Queue } = require('bullmq')
const { redis } = require('../config/redis.config')


// now create a queues

const notificationQueues = new Queue("notificationQueues",
    {
        connection: redis,
        defaultJobOptions: {
            attempts: +process.env.ATTEMPT || 3,
            backoff: {
            type: "exponential",
            delay: +process.env.DELAY || 5000
            },
            removeOnComplete: false,
            removeOnFail: false,
            timeout: +process.env.TIMEOUT || 30000     
  },
        
    },
    
)
console.log("Msg Queues is init")

module.exports={notificationQueues}