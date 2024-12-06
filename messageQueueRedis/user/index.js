import express from 'express';
import morgan from 'morgan';
import { v4 as uuid } from 'uuid';
import { Queue} from 'bullmq';

const app = express();

app.use(morgan('dev'));
app.use(express.json());

const queue = new Queue('image-processing-queue', {
    connection: {
        host: 'localhost',
        port: 6379
    }
})
app.post('/queue', async (req, res) => {
    try {
        queue.add('image-processing-job', {
            fileName: `${uuid()}.mp4`,
            task: req.body.taskName,
            userId: req.body.userId
        }, {
            priority:req.body.priority,
            removeOnComplete: true,
            removeOnFail: true,
            attempts: 2,
            backoff: {
                type: 'exponential',
                delay: 1000
        }
        });
        res.status(200).send('Job added to queue');
    } catch (error) {
        res.send(error)
    }
})

app.listen(3000, () => {    
    console.log('Server started on port 3000');
});