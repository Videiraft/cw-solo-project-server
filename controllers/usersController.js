const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/usersModel');

exports.createUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) res.status(409).send({ status: 'fail', err: 'The user already exists!'});
    else {
      const saltRounds = 10;
      const hash = await bcrypt.hash(password, saltRounds);
      const newUser = {
        email,
        password: hash,
      };
      const createdUser = await User.create(newUser);
      res.status(201).send({ email: createdUser.email, id: createdUser._id }); // eslint-disable-line
    }
  } catch (err) {
    res.status(500).send({ status: 'fail', err });
  }
};

exports.login = async (req, res) => {
  try {
    // check if there is a basic authorization header
    const basicAuth = req.headers.authorization.split(' ');
    if (basicAuth.length !== 2 || basicAuth[0] !== 'Basic') {
      throw new Error('Missing basic authorization header.');
    }
    // set email and password from the header and check the database for a match
    const [email, password] = Buffer.from(basicAuth[1], 'base64').toString().split(':');
    const user = await User.findOne({ email });
    if (!user) res.status(401).send({ status: 'fail', err: 'The user doesn\'t exist!'});
    else {
      const match = await bcrypt.compare(password, user.password);
      // if there is a match send the token to the client
      if (match) {
        const filteredUser = Object.keys(user._doc) // eslint-disable-line
          .filter(key => key === 'email' || key === '_id')
          .reduce((newObj, key) => {
            newObj[key] = user[key]; // eslint-disable-line
            return newObj;
          }, {});
        // sign and send the json web token
        jwt.sign(filteredUser, process.env.SECRET, (err, token) => {
          if (err) {
            console.log(err); // eslint-disable-line
            res.status(401).send({ status: 'fail', err: 'Error signing, please retry!' });
          } else {
            res.status(200).send({ id_token: token });
          }
        });
      } else {
        res.set({
          'WWW-Authenticate': 'Basic',
        });
        res.status(401).send({ status: 'fail', err: 'Could not Login, the inserted password is wrong!' });
      }
    }
  } catch (err) {
    console.log(err); // eslint-disable-line
    res.status(500).send({ status: 'fail', err });
  }
};

exports.createLink = async (req, res) => {
  try { // url, tags, expirationDate?, type?
    // TODO: review the properties to possibly add type (for render purposes) or library?
    const link = {
      title: req.body.title,
      description: req.body.description,
      url: req.body.url,
      tags: req.body.tags,
      favicon: req.body.favicon,
    };
    const exists = await User.findOne({ _id: req.authData._id, 'links.url': link.url }); // eslint-disable-line
    if (exists) {
      res.status(400).send({ status: 'fail', err: 'link already exists' });
    } else {
      const updatedUser = await User.findByIdAndUpdate(
        req.authData._id, // eslint-disable-line
        { $push: { links: link }, $addToSet: { tags: { $each: [...link.tags] } } },
        { new: true },
      );
      res.status(200).send(updatedUser.links.find(({ url }) => url === link.url));
    }
  } catch (err) {
    res.status(500).send({ status: 'fail', err });
  }
};

exports.getAllLinks = async (req, res) => {
  try {
    const user = await User.findById(req.authData._id); // eslint-disable-line
    res.status(200).send(user.links);
  } catch (err) {
    res.status(500).send({ status: 'fail', err });
  }
};

exports.getAllTags = async (req, res) => {
  try {
    const user = await User.findById(req.authData._id); // eslint-disable-line
    res.status(200).send(user.tags);
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

// TODO: feature - Implement Libraries. (Front-end or back-end filter?)
// exports.getLinksByLibrary = async (req, res) => {
//   try {
//     User.aggregate([
//       { $match: { _id: mongoose.Types.ObjectId(req.authData._id) } },
//       { $unwind: '$links' },
//       { $match: { 'links.library': req.params.library } },
//     ], (err, results) => {
//       if (err) res.status(404).send({ status: 'fail', err: 'Library doesn\'t exist' });
//       // TODO: filter the password
//       res.status(200).send(results);
//     });
//   } catch (err) {
//     res.status(500).send({ status: 'fail', err });
//   }
// };

