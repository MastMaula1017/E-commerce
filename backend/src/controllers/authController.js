import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

// Register a new user

const isProd = process.env.NODE_ENV === "production";

const baseCookieOptions = {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "strict" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    };

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ msg: "Name, email and password are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
    });

    const token = generateToken(user._id, user.role);

    res.cookie("token", token, baseCookieOptions)
    .status(201)
    .json({
        user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        },
});
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Login existing user
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.status(403).json({ msg: "Account is deactivated. Please contact support." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = generateToken(user._id, user.role);
  
    res.cookie("token", token, baseCookieOptions)
      .status(200)
      .json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Logout user (clear cookie)
export const logout = (req, res) => {

  res.cookie("token", "", { ...baseCookieOptions, expires: new Date(0), })
    .status(200)
    .json({ msg: "Logged out" });
};

// Get current logged in user
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email role");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};
