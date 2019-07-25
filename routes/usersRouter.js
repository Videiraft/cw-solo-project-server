const router = require('express').Router();
const ctrl = require('../controllers/usersController');

router
  .post('/', ctrl.createUser)
  .get('/sign-in', ctrl.signIn)

  .post('/links', ctrl.createLink)
  .get('/links', ctrl.getLinks)
  .delete('/links/:id', ctrl.deleteLink);

module.exports = router;
