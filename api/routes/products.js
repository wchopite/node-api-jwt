/**
 * Product routes
 */
const config = require('config'), 
    express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    multer = require('multer'),
    checkAuth = require('../middlewares/check-auth'),
    Product = require('../models/product');

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

router.get('/', async (req, res, next) => {
    try {
        const products = await Product
            .find({})
            .select('-__v');

        const response = {
            count: products.length,
            products: products.map((p) => {
                return {
                    _id: p._id,
                    name: p.name,
                    price: p.price,
                    productImage: p.productImage,
                    request: {
                        type: 'GET',
                        url: `${config.get('App.url')}/products/${p._id}`
                    }
                }
            })
        };

        res.status(200).json(response);
    } catch(err) {
        res.status(500).json({error: err});
    }
});

router.post('/', checkAuth, upload.single('productImage'), async (req, res, next) => {
    const product = new Product({
        _id: mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });

    try {
        await product.save();
        res.status(201).json({
            message: 'Created successfully',
            product: {
                _id: product._id,
                name: product.name,
                price: product.price,
                productImage: product.productImage,
                request: {
                    type: 'GET',
                    url: `${config.get('App.url')}/products/${product._id}`
                }
            }
        });
    } catch(err) {
        res.status(500).json({error: err});
    }
});

router.get('/:productId', async (req, res, next) => {
    const id = req.params.productId;

    try {
        const product = await Product
            .findById(id)
            .select('-__v');

        if (!product) {
            res.status(404).json({ message: 'Not found' });
            return;
        }
        res
            .status(200)
            .json({
                product,
                request: {
                    type: 'GET',
                    url: `${config.get('App.url')}/products`
                }
            });
    } catch(err) {
        res.status(500).json({error: err});
    }
});

router.patch('/:productId', checkAuth, async (req, res, next) => {
    const id = req.params.productId,
        updateOps = {},
        props = Object.keys(req.body);
    
    for(const prop of props) {
        updateOps[prop] = req.body[prop];
    }

    try {
        const product = await Product
            .findByIdAndUpdate(id,{
                $set: updateOps
            },{
                select: '-__v',
                new: true
            });
        res.status(200)
            .json({
                message: 'Updated successfully',
                product,
                request: {
                    type: 'GET',
                    url: `${config.get('App.url')}/products/${product._id}`
                }
            });
    } catch(err) {
        res.status(500).json({ error: err });
    }
});

router.delete('/:productId', checkAuth, async (req, res, next) => {
    const id = req.params.productId;

    try {
        const product = await Product.findByIdAndRemove(id, { select: '-__v' });
        if (!product) {
            res.status(404).json({ message: 'Not found' });
            return;
        }
        res.status(200).json({
            message: 'Deleted successfully',
            product
        });
    } catch(err) {
        res.status(500).json({ error: err });
    }
});

module.exports = router;
