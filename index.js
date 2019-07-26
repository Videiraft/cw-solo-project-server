const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const usersRouter = require('./routes/usersRouter');

dotenv.config({ path: './config.env' });

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
