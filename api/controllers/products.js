/**
 * 
 */
const config = require('config'),
    mongoose = require('mongoose'),
    Product = require('../models/product');

let productsController = {};

productsController.getAll = async (req, res, next) => {
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
};

productsController.create = async (req, res, next) => {
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
};

productsController.get = async (req, res, next) => {
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
};

productsController.update = async (req, res, next) => {
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
};

productsController.delete = async (req, res, next) => {
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
};

module.exports = productsController;
