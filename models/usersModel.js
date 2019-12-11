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
    type: [{
      title: String,
      url: String,
      description: String,
      typeLink: String,
      tags: [String],
      favicon: String,
      sent: {
        type: Boolean,
        default: false,
      },
    }],
    default: [],
  },
});

const User = mongoose.model('User', Schema);
module.exports = User;
