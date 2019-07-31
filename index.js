const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const schedule = require('node-schedule');
const usersRouter = require('./routes/usersRouter');
const emailController = require('./controllers/emailController');

dotenv.config({ path: './config.env' });

// Send email for users everyday at 07:00
schedule.scheduleJob('40 * * * *', () => {
  emailController.sendEmail();
});

const app = express();

app.use(cors());
app.use(express.json());
app.use('/users', usersRouter);

mongoose.connect(
  'mongodb://localhost/soloTest',
  { useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true },
);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Listening on port ${PORT}...`); // eslint-disable-line
});
