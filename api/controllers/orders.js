/**
 * 
 */
const config = require('config'),
    mongoose = require('mongoose'),
    Order = require('../models/order'),
    Product = require('../models/product');

let ordersController = {};

ordersController.getAll = async (req, res, next) => {
    try {
        const orders = await Order
            .find({})
            .select('-__v')
            .populate('product', '_id name productImage');

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
};

ordersController.create = async (req, res, next) => {
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
                        productImage: product.productImage,
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
};

ordersController.get = async (req, res, next) => {
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
};

ordersController.delete = async (req, res, next) => {
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
};

module.exports = ordersController;
