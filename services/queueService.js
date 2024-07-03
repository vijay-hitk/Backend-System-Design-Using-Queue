const amqp = require('amqplib');

let channel;

const connectQueue = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  channel = await connection.createChannel();
  await channel.assertQueue('requestQueue', { durable: true });
};

const sendToQueue = (message) => {
  channel.sendToQueue('requestQueue', Buffer.from(message), { persistent: true });
};

module.exports = { connectQueue, sendToQueue };
