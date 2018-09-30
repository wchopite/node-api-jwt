/**
 * Users
 */
const config = require('config'),
    express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    bcrypt = require('bcrypt'),
    jwt = require('jsonwebtoken'),
    User = require('../models/user');

router.post('/signup', async (req, res, next) => {
    try {
        const exists = await User.findOne({ email: req.body.email });

        if (exists) {
            res.status(409).json({ message: 'the indicated mail exists' });
            return;
        }

        const user = new User({
            _id: mongoose.Types.ObjectId(),
            email: req.body.email,
            password: await bcrypt.hash(req.body.password, 10)
        });

        try {
            await user.save();
            res.status(201).json({
                message: 'Created successfully'
            });
        } catch(err) {
            throw(err);
        }
    } catch(err) {
        res.status(500).json({ error: err });
    }
});

router.post('/login', async (req, res, next) => {
    const email = req.body.email || null,
        password = req.body.password || null;
    
    try {
        const user = (email) ? await User.findOne({ email }).select('-__v') : null,
            validPassword = (user && password) ? await bcrypt.compare(password, user.password) : false;

        if (!user || !validPassword) {
            res.status(401).json({ message: 'Auth Failed'});
            return;
        }

        const token = jwt.sign(
            {
                email,
                userId: user._id
            },
            config.get('JWT.private_key'),
            {
                expiresIn: config.get('JWT.expirationTime')
            }
        );
        res.status(200).json({ message: 'Auth successful', token });            
    } catch(err) {
        res.status(500).json({ error: err });
    }
});

router.delete('/:userId', async (req, res, next) => {
    const id = req.params.userId;

    try {
        const user = await User.findByIdAndRemove(id);
        if (!user) {
            res.status(404).json({ message: 'Not found' });
            return;
        }
        res.status(200).json({
            message: 'Deleted successfully'
        });
    } catch(err) {
        res.status(500).json({ error: err });
    }
});

module.exports = router;

