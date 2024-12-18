const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'your_jwt_secret';

const authenticateUser = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; 
    console.log('Authorization header:', req.headers.authorization);

    
    if (!token) {
        return res.status(401).send({ message: 'Token must be provided' });
    }

    try {
        const decodedToken = jwt.verify(token, secret);
        req.userId = decodedToken.id; 
        next(); 
    } catch (error) {
        return res.status(401).send({ message: 'Invalid or expired token' });
    }
};


module.exports = authenticateUser;
