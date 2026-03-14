const { Worker } = require("bullmq");
const { redis } = require("../config/redis.config");
const { sendMail } = require("../services/notification.service");


function initWorker() {
    const worker = new Worker(
        "notificationQueues",
        async (job) => {
            const { email, subject, message } = job.data;
            // console.log(job.data);
            await sendMail();
        },
        {
            connection: redis,
            concurrency: 5
        }
    );
    worker.on("completed", (job) => {
        console.log(`Job ${job.id} completed`);
    });
   /** if its failed then we need to add in dlq table so that we can again do retry over these list */
    worker.on("failed", async (job, err) => {

        console.error(`Job ${job.id} failed. Attempt: ${job.attemptsMade}`);

        const maxAttempts = job.opts.attempts || 1;

        if (job.attemptsMade >= maxAttempts) {

            console.log("Final failure detected → storing in DLQ DB");

            await saveToDLQDatabase({
                jobId: job.id,
                payload: job.data,
                error: err.message,
                attempts: job.attemptsMade,
                failedAt: new Date()
            });

        } else {

            console.log("Retry will happen, not moving to DLQ");

        }

    });

    worker.on("error", (err) => {
        console.error("Worker error:", err);
    });
}



module.exports = { initWorker }