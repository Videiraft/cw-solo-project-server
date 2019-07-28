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
      url: String,
      tags: [String],
      favicon: String,
    }],
    default: [],
  },
  tags: {
    type: Array,
    default: [],
  },
});
// {
//   libraries: {
//     type: [{
//       name: String,
//       links: {
//         type: [{
//           url: String,
//           tags: [String],
//           library String,
//         }],
//         default: [],
//       }
//     }],
//     default: [],
//   }
// }

const User = mongoose.model('User', Schema);
module.exports = User;
