import jwt from "jsonwebtoken";

// Authenticate user based on JWT stored in HTTP-only cookie
const authenticate = (req, res, next) => {
    const token = req.cookies ? req.cookies.token : null;

    if (!token) {
        return res.status(401).json({ msg: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ msg: "Invalid token" });
    }
};  

// Authorize based on allowed roles (e.g., 'customer', 'admin')
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ msg: "Not authenticated" });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ msg: "Unauthorized access" });
        }

        next();
    };
};

export { authenticate, authorize };
