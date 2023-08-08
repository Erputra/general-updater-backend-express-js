const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header('x-auth-token');

    if (!token){
        return res.status(401).json({error: 'No token, authorization denied'});
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);
        req.user = decoded.username; // Assign the username to req.user
        req.decodedToken = decoded; // You can also store the entire decoded token if needed
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ error: 'Token is not valid'});
    }
};

module.exports = authMiddleware;