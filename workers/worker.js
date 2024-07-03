const amqp = require('amqplib');
const mongoose = require('mongoose');
const User = require('../models/user');
require('dotenv').config();

const processMessage = async (msg) => {
  const content = JSON.parse(msg.content.toString());
  console.log(`Processing request for user: ${content.userId}`);
  // Add your request processing logic here
  setTimeout(() => {
    console.log(`Request processed for user: ${content.userId}`);
  }, 2000);
};

const startWorker = async () => {
  await mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue('requestQueue', { durable: true });

  channel.consume('requestQueue', async (msg) => {
    await processMessage(msg);
    channel.ack(msg);
  });

  console.log('Worker started');
};

startWorker();
