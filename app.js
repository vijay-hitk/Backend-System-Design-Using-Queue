const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const { connectQueue, sendToQueue } = require('./services/queueService');
const userController = require('./controllers/userController');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Database connected'));

connectQueue().then(() => console.log('Queue connected'));

app.use('/api/users', userRoutes);

app.post('/enqueue', userController.protect, (req, res) => {
  const message = JSON.stringify({ userId: req.user._id, request: req.body });
  sendToQueue(message);
  res.status(200).send('Request enqueued');
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
