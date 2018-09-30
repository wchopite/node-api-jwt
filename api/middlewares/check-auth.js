/**
 * 
 */
const config = require('config'), 
    jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = (req.headers.authorization) ?
        req.headers.authorization.split(' ')[1] :
        null;
    jwt.verify(token, config.get('JWT.private_key'), (err, decoded) => {
        if (err) {
            res
                .status(401)
                .json({ message: 'Auth failed' });
            return;
        }

        req.userData = decoded;
        next();
    });
};