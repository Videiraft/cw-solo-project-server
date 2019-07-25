const bcrypt = require('bcrypt');
const User = require('../models/usersModel');

exports.createUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    const newUser = {
      email,
      password: hash,
    };
    User.create(newUser);
    res.status(200).send({ email });
  } catch (err) {
    res.status(500).send({ status: 'fail', err });
  }
};

exports.signIn = async (req, res) => {
  try {
    // check if there is a basic authorization header
    const basicAuth = req.headers.authorization.split(' ');
    if (basicAuth.length !== 2 || basicAuth[0] !== 'Basic') {
      throw new Error('Missing basic authorization header.');
    }
    // set email and password from the header and check the database for a match
    const [email, password] = Buffer.from(basicAuth[1], 'base64').toString().split(':');
    const user = await User.findOne({ email });
    const match = await bcrypt.compare(password, user.password);
    // if there is a match send the user to the client after filtering the password
    if (match) {
      const filteredUser = Object.keys(user._doc) // eslint-disable-line
        .filter(key => key !== 'password')
        .reduce((newObj, key) => {
          newObj[key] = user[key]; // eslint-disable-line
          return newObj;
        }, {});
      res.status(200).send(filteredUser);
    }
  } catch (err) {
    res.status(500).send({ status: 'fail', err });
  }
};

exports.getLinks = (req, res) => {
  try {
    console.log('TODO: getLinks');
  } catch (err) {
    res.status(500).send({ status: 'fail', err });
  }
};

exports.createLink = (req, res) => {
  try {
    // TODO: generate id with uuid
    console.log('TODO: createLink');
  } catch (err) {
    res.status(500).send({ status: 'fail', err });
  }
};

exports.deleteLink = (req, res) => {
  try {
    console.log('TODO: deleteLink');
  } catch (err) {
    res.status(500).send({ status: 'fail', err });
  }
};
