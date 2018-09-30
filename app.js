/**
 * Node API JWT App
 */
const express = require('express'),
    config = require('config'),
    app = express(),
    logger = require('morgan'),
    mongoose = require('mongoose');

const producRoutes = require('./api/routes/products'),
    orderRoutes = require('./api/routes/orders'),
    userRoutes = require('./api/routes/users');

/**
 * Try Connect to MongoDB
 */
mongoose.connect(
    config.get('Mongo.url'),
    { useNewUrlParser: true }
);

app.use(logger('dev'));
app.use('/uploads', express.static('uploads'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

/**
 * Allow Origin
 */
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        res.status(200).json({});
        return;
    }
    next();
});

// Add routes
app.use('/products', producRoutes);
app.use('/orders', orderRoutes);
app.use('/users', userRoutes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

// error handler
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;
