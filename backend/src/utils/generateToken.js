import jwt from "jsonwebtoken";

// Helper to create a JWT for a given user id and role
const generateToken = (userId, role) => {
    return jwt.sign(
        { id: userId, role },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d",
        }
    );
};

export default generateToken;
