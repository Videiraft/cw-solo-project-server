const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  links: {
    type: Array,
    default: [],
  },
});

const User = mongoose.model('User', Schema);
module.exports = User;
