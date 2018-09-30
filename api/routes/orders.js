/**
 * Orders routes
 */
const config = require('config'), 
    express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    checkAuth = require('../middlewares/check-auth'),
    Order = require('../models/order'),
    Product = require('../models/product');

router.get('/', checkAuth, async (req, res, next) => {
    try {
        const orders = await Order
            .find({})
            .select('-__v')
            .populate('product', '_id name');

        const response = {
            count: orders.length,
            orders: orders.map((o) => {
                return {
                    _id: o._id,
                    quantity: o.quantity,
                    product: o.product,
                    request: {
                        type: 'GET',
                        url: `${config.get('App.url')}/orders/${o._id}`
                    }
                }
            })
        };

        res.status(200).json(response);
    } catch(err) {
        res.status(500).json({error: err});
    }
});

router.post('/', checkAuth, async (req, res, next) => {
    // TODO: add validation to verify if the product exists
    try {
        const product = await Product
            .findById(req.body.productId)
            .select('-__v');

        if (!product) {
            res.status(400).json({ message: 'The product does not exists' });
            return;
        }

        const order = new Order({
            _id: mongoose.Types.ObjectId(),
            quantity: req.body.quantity,
            product: req.body.productId
        });

        try {
            await order.save();
            res.status(201).json({
                message: 'Created successfully',
                order: {
                    _id: order._id,
                    quantity: order.quantity,
                    product: {
                        _id: product._id,
                        name: product.name,
                        price: product.price,
                        request: {
                            type: 'GET',
                            url: `${config.get('App.url')}/products/${product._id}`
                        }
                    },
                    request: {
                        type: 'GET',
                        url: `${config.get('App.url')}/orders/${order._id}`
                    }
                }
            });
        } catch(err) {
            res.status(500).json({error: err});
        }
    } catch(err) {
        res.status(500).json({ error: err });
        return;
    }
});

router.get('/:orderId', checkAuth, async (req, res, next) => {
    const id = req.params.orderId;

    try {
        const order = await Order
            .findById(id)
            .select('-__v')
            .populate('product', '_id name');

        if (!order) {
            res.status(404).json({ message: 'Not found' });
            return;
        }
        res
            .status(200)
            .json({
                order,
                request: {
                    type: 'GET',
                    url: `${config.get('App.url')}/orders`
                }
            });
    } catch(err) {
        res.status(500).json({error: err});
    }
});

router.delete('/:orderId', checkAuth, async (req, res, next) => {
    const id = req.params.orderId;

    try {
        const order = await Order.findByIdAndRemove(id, { select: '-__v' });
        if (!order) {
            res.status(404).json({ message: 'Not found' });
            return;
        }
        res.status(200).json({
            message: 'Deleted successfully',
            order
        });
    } catch(err) {
        res.status(500).json({ error: err });
    }
});

module.exports = router;
