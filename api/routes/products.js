/**
 * Product routes
 */
const express = require('express'),
    router = express.Router(),
    multer = require('multer'),
    checkAuth = require('../middlewares/check-auth');

// Import the controller
const productsController = require('../controllers/products');

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpge' || file.mimetype === 'image/png') {
        cb(null, true);
        return;
    }
    cb(new Error('Type of file not allowed'), false);
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname);
    }
}),
    upload = multer({
        storage,
        limits: {
            fileSize: 1024 * 1024 * 5
        },
        fileFilter
    });

// Routes
router.get('/', productsController.getAll);
router.post('/', checkAuth, upload.single('productImage'), productsController.create);
router.get('/:productId', productsController.get);
router.patch('/:productId', checkAuth, productsController.update);
router.delete('/:productId', checkAuth, productsController.delete);

module.exports = router;
