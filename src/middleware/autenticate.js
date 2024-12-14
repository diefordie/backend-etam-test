const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'your_jwt_secret';

const authenticateUser = (req, res, next) => {
    // Untuk testing, set authorId secara manual
    if (process.env.NODE_ENV === 'test') {
        req.user = { id: 'dummyAuthorId123' };
        return next();
    }

    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).send({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, secret);
        req.user = { id: decoded.id };
        next();
    } catch (error) {
        res.status(401).send({ message: 'Invalid token' });
    }
};

module.exports = authenticateUser;
