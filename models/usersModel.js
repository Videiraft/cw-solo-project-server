const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
  email: {
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
  tags: {
    type: Array,
    default: [],
  },
});

const User = mongoose.model('User', Schema);
module.exports = User;
