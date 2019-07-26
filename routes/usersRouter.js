const router = require('express').Router();
const ctrl = require('../controllers/usersController');
const authMdw = require('../middlewares/authorization');

router
  .post('/', ctrl.createUser)
  .get('/login', ctrl.login)

  .put('/links', authMdw, ctrl.createLink)
  .get('/links', authMdw, ctrl.getLinks)
  .patch('/links/:urlId', authMdw, ctrl.deleteLink);

module.exports = router;
