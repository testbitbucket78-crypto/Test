const { Queue, Worker } = require('bullmq');
const {identifyNode} = require('../IncommingMessages');

// Just pass the connection config object
// const connection = {
//   host: '52.66.172.213',
//   port: 6379,
//   username: 'engagekart',
//   password: 'enGaGEkart3214!'
// };

const messageQueue = new Queue('messageQueue', { connection });

async function getMemoryUsage() {
  const Redis = require('ioredis');
  const redis = new Redis(connection);

  const memoryInfo = await redis.info('memory');
  const usedMemory = memoryInfo
    .split('\n')
    .find(line => line.startsWith('used_memory_human'))
    ?.split(':')[1]
    ?.trim();

  redis.disconnect();
  return usedMemory;
}

async function addJobs(botId, data, delaySeconds) {
  const delay = delaySeconds * 1000; // ms
  await messageQueue.add(
    'sendMessage',
    { botId, data },
    { delay }
  );
}

const worker = new Worker(
  'messageQueue',
  async job => {
    console.log('Processing job:', job.id, job.data);

   identifyNode(job.data);
    console.log('--------------ending----------');
    console.log(rl,'--------------rl----------');
  },
  { connection } 
);



module.exports = { addJobs }