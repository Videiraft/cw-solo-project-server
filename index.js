const express = require('express');
const mongoose = require('mongoose');
const usersRouter = require('./routes/usersRouter');

const app = express();

app.use(express.json());
app.use('/users', usersRouter);

mongoose.connect(
  'mongodb://localhost/soloTest',
  { useNewUrlParser: true, useFindAndModify: false },
);

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`🚀 Listening on port ${PORT}...`); // eslint-disable-line
});
