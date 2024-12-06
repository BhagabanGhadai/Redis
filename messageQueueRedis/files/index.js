import express from 'express';
import morgan from 'morgan';
import { v4 as uuid } from 'uuid';
import { Worker, QueueEvents, Queue } from 'bullmq';

const app = express();

app.use(morgan('dev'));
app.use(express.json());


const worker = new Worker('image-processing-queue', async job => {
    if (job.name === 'image-processing-job') {
        await processFile(job.data);
    }
}, {
    connection: {
        host: 'localhost',
        port: 6379
    }
}
);
const queueEvents = new QueueEvents('image-processing-queue');

async function processFile(data) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    console.log(data.fileName + ' processed');
}

worker.on('failed', (job, failedReason) => {
    console.error(job.id, ' error ', failedReason);
})
worker.on('completed', (job) => {
    console.log(job.id + ' completed');
})

// Add event listeners
queueEvents.on('waiting', ({ jobId }) => {
    console.log(`A job with ID ${jobId} is waiting`);
});

queueEvents.on('active', ({ jobId, prev }) => {
    console.log(`Job ${jobId} is now active; previous status was ${prev}`);
});

queueEvents.on('completed', ({ jobId, returnvalue }) => {
    console.log(`${jobId} has completed and returned ${returnvalue}`);
});

queueEvents.on('failed', ({ jobId, failedReason }) => {
    console.log(`${jobId} has failed with reason ${failedReason}`);
});

queueEvents.on('progress', ({ jobId, data }, timestamp) => {
    console.log(`${jobId} reported progress ${data} at ${timestamp}`);
});

app.listen(4000, () => {
    console.log('Server started on port 4000');
});