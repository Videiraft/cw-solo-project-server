const router = require('express').Router();
const ctrl = require('../controllers/usersController');

router
  .get('/sign-in', ctrl.signIn)
  .post('/', ctrl.createUser)
  .post('/links', ctrl.createLink)
  .get('/links', ctrl.getLinks)
  .delete('/links/:id', ctrl.deleteLink);

module.exports = router;
