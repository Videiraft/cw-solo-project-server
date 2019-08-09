const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/usersModel');

exports.createUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // find if the user/email already exists and send a warning response if true
    const user = await User.findOne({ email });
    if (user) res.status(409).send({ status: 'fail', data: { email: 'This email already exists.' } });
    // else create a new user/email
    else {
      const saltRounds = 10;
      const hash = await bcrypt.hash(password, saltRounds);
      const newUser = {
        email,
        password: hash,
      };
      const createdUser = await User.create(newUser);
      res.status(201).send({ status: 'success', data: { email: createdUser.email, id: createdUser._id } }); // eslint-disable-line
    }
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    // check if there is a basic authorization header
    const basicAuth = req.headers.authorization.split(' ');
    if (basicAuth.length !== 2 || basicAuth[0] !== 'Basic') {
      throw new Error('Missing basic authorization header.');
    }
    // set email and password from the header and check the database for a match
    const [email, password] = Buffer.from(basicAuth[1], 'base64').toString().split(':');
    const user = await User.findOne({ email });
    if (!user) res.status(401).send({ status: 'fail', data: { email: 'This email doesn\'t exist.' } });
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
            res.status(401).send({ status: 'fail', err });
          } else {
            res.status(200).send({ status: 'success', data: { id_token: token } });
          }
        });
      // else the password is wrong
      } else {
        res.set({
          'WWW-Authenticate': 'Basic',
        });
        res.status(401).send({ status: 'fail', err: { password: 'The password is wrong.' } });
      }
    }
  } catch (err) {
    next(err);
  }
};

exports.createLink = async (req, res, next) => {
  try {
    const { url } = req.body;
    let typeLink;
    // set typeLink to video if url is an youtube video
    if (url.includes('youtube.com')) {
      typeLink = 'video';
    // set typeLink to image if url is an image link
    } else if (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png')) {
      const index = url.indexOf('?');
      if (index !== -1) url.slice(url.indexOf('?'));
      typeLink = 'image';
    // else set typeLink to article
    } else {
      typeLink = 'article';
    }
    // set all properties of the new link
    const link = {
      title: req.body.title,
      description: req.body.description,
      typeLink,
      url: req.body.url,
      tags: req.body.tags,
      favicon: req.body.favicon,
    };
    // check if link/url already exists
    const exists = await User.findOne({ _id: req.authData._id, 'links.url': link.url }); // eslint-disable-line
    if (exists) {
      res.status(409).send({ status: 'fail', err: { url: 'This url already exists.' } });
    // if it doesn't exist yet, create it
    } else {
      const updatedUser = await User.findByIdAndUpdate(
        req.authData._id, // eslint-disable-line
        { $push: { links: link }, $addToSet: { tags: { $each: [...link.tags] } } },
        { new: true },
      );
      res.status(200).send({ status: 'success', data: { link: updatedUser.links.find(({ url }) => url === link.url) } });
    }
  } catch (err) {
    next(err);
  }
};

exports.getAllLinks = async (req, res, next) => {
  try {
    const user = await User.findById(req.authData._id); // eslint-disable-line
    res.status(200).send({ status: 'success', data: { links: user.links } });
  } catch (err) {
    next(err);
  }
};

exports.getAllTags = async (req, res, next) => {
  try {
    const user = await User.findById(req.authData._id); // eslint-disable-line
    res.status(200).send({ status: 'success', data: { tags: user.tags } });
  } catch (err) {
    next(err);
  }
};

exports.deleteLink = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(
      req.authData._id, // eslint-disable-line
      { $pull: { links: { _id: req.params.urlId } } },
      // { new: true },
    );
    res.status(200).send({ status: 'success', data: null });
  } catch (err) {
    next(err);
  }
};

// TODO: possible feature - Implement Libraries. (Front-end or back-end filter?)
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
