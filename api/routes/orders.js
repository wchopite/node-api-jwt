/**
 * Orders routes
 */
const config = require('config'), 
    express = require('express'),
    router = express.Router(),
    checkAuth = require('../middlewares/check-auth');

// Import the controller
const orderController = require('../controllers/orders');

// Routes
router.get('/', checkAuth, orderController.getAll);
router.post('/', checkAuth, orderController.create);
router.get('/:orderId', checkAuth, orderController.get);
router.delete('/:orderId', checkAuth, orderController.delete);

module.exports = router;
