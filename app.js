const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const schedule = require('node-schedule');
const usersRouter = require('./routes/usersRouter');
const emailController = require('./controllers/emailController');
const { errorHandling } = require('./middlewares/errorHandling');

dotenv.config({ path: './.env' });

// Send email for users everyday at 07:00
schedule.scheduleJob('00 07 * * *', () => {
  emailController.sendEmail();
});

const app = express();
app.use(cors());
app.use(express.json());
app.use('/users', usersRouter);
app.use(errorHandling);

module.exports = app;
