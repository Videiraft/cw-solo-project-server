const mongoose = require('mongoose');
const app = require('./app');

const { PORT } = process.env;
const { DB_URL } = process.env;

mongoose.connect(
  DB_URL,
  { useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true },
)
  .then(() => {
    console.log('Connected to database.'); // eslint-disable-line
    app.listen(PORT, () => {
      console.log(`🚀 Listening on port ${PORT}...`); // eslint-disable-line
    });
  })
  .catch((err) => {
    console.log(err); // eslint-disable-line
  });
