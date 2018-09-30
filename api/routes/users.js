/**
 * Users
 */
const express = require('express'),
    router = express.Router(),
    checkAuth = require('../middlewares/check-auth');

// Import the controller
let usersController = require('../controllers/users');

// Routes
router.post('/signup', usersController.signup);
router.post('/login', usersController.login);
router.delete('/:userId', checkAuth, usersController.delete);

module.exports = router;
