// const { Queue, Worker } = require('bullmq');
// const connection = { host: '127.0.0.1', port: 6379 };

// // Create Queue
// const messageQueue = new Queue('messageQueue', { connection });

// // Worker to process jobs
// const worker = new Worker('messageQueue', async job => {
//   console.log(`[${new Date().toISOString()}] Sending to user ${job.data.userId}: ${job.data.text}`);
// }, { connection });

// // Schedule jobs
// async function run() {
//     console.log('Scheduling messages...');
//   for (let i = 1; i <= 1000; i++) {
//     await messageQueue.add('sendMessage', {
//       userId: i,
//       text: `Hello user ${i}`
//     }, {
//       delay: Math.floor(Math.random() * 30 + 1) * 1000, 
//     });
//   }
//   console.log('📨 All messages scheduled.');
// }

// run();



const { Queue, Worker } = require('bullmq');
const Redis = require('ioredis');
const incommingmsg = require('../IncommingMessages')
const redis = new Redis();

const messageQueue = new Queue('messageQueue', {
  connection: redis
});

async function getMemoryUsage() {
  const memoryInfo = await redis.info('memory');
  const usedMemory = memoryInfo
    .split('\n')
    .find(line => line.startsWith('used_memory_human'))
    ?.split(':')[1]
    ?.trim();
  return usedMemory;
}

async function addJobs(botId, data,delaySeconds) {

    const delay = delaySeconds*1000; // 1s to 30s
    await messageQueue.add('sendMessage', {
      botId: botId,
      data: data
    }, {
      delay: delay,
    });
  }

const worker = new Worker('messageQueue', async job => {
  //const { botId, nodeId } = job;
  incommingmsg.identifyNode(job?.data)
    }, { redis });
    

// (async () => {
//   await addJobs(100);
//   await addJobs(300);
//   await addJobs(1000);

//   await messageQueue.close();
//   redis.disconnect();
// })();

module.exports = { addJobs }