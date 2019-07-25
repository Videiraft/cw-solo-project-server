const jwt = require('jsonwebtoken');

const authorizationMdware = (req, res, next) => {
  try {
    let token = req.headers['x-access-token'] || req.headers.authorization;
    if (token) {
      token = token.slice(7, token.length);
      // Verify the token and if valid call next middleware
      jwt.verify(token, process.env.SECRET, (err, authData) => {
        if (err) {
          return res.json({
            success: false,
            message: 'Token is not valid',
          });
        }
        req.authData = authData;
        console.log('Authorization conceded!'); // eslint-disable-line
        return next();
      });
    }
  } catch (err) {
    res.status(500).send({ status: 'fail', err });
  }
};

module.exports = authorizationMdware;
