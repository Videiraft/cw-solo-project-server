const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const uuidv4 = require('uuid/v4');
const User = require('../models/usersModel');

exports.createUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    const user = {
      email,
      password: hash,
    };
    const newUser = await User.create(user);
    res.status(201).send({ email: newUser.email, id: newUser._id }); // eslint-disable-line
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
    // if there is a match send the token to the client
    if (match) {
      const filteredUser = Object.keys(user._doc) // eslint-disable-line
        .filter(key => key !== 'password')
        .reduce((newObj, key) => {
          newObj[key] = user[key]; // eslint-disable-line
          return newObj;
        }, {});
      // sign and send the json web token
      jwt.sign(filteredUser, process.env.SECRET, { expiresIn: '2 days' }, (err, token) => {
        if (err) { console.log(err); } // eslint-disable-line
        res.status(200).send(token);
      });
    } else {
      res.set({
        'WWW-Authenticate': 'Basic',
      });
      res.status(401).send({ status: 'fail', err: 'Could not Login' });
    }
  } catch (err) {
    res.status(500).send({ status: 'fail', err });
  }
};

exports.createLink = async (req, res) => {
  try { // url, tags, expirationDate?, type?
    // TODO: review the properties and refactor code
    const link = {
      urlId: uuidv4(),
      url: req.body.url,
      tags: req.body.tags,
    };
    const user = await User.findById(req.authData._id); // eslint-disable-line
    const exists = user.links.reduce((acc, linkEle) => {
      if (linkEle.url === link.url) return true;
      return false;
    }, false);
    if (exists) {
      res.status(400).send({ status: 'fail', err: 'link already exists' });
    } else {
      const updatedUser = await User.findByIdAndUpdate(
        req.authData._id, // eslint-disable-line
        { $push: { links: link } },
        { new: true },
      );
      res.status(200).send(updatedUser.links);
    }
  } catch (err) {
    res.status(500).send({ status: 'fail', err });
  }
};

exports.getLinks = async (req, res) => {
  try {
    const user = await User.findById(req.authData._id); // eslint-disable-line
    res.status(200).send(user.links);
  } catch (err) {
    res.status(500).send({ status: 'fail', err });
  }
};

exports.deleteLink = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.authData._id, // eslint-disable-line
      { $pull: { links: { urlId: req.params.urlId } } },
      { new: true },
    );
    res.status(200).send(updatedUser.links);
  } catch (err) {
    res.status(500).send({ status: 'fail', err });
  }
};
