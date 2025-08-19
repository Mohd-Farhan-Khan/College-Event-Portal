import User from "../models/userModel.js";
import { signToken } from "../config/jwt.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, college } = req.body;
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });
    // `password` alias maps to `passwordHash`, and `college` alias maps to `college_id` via schema
    const user = await User.create({ name, email, password, role, college });
    const token = signToken({ id: user._id, role: user.role });
    res
      .status(201)
      .json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = signToken({ id: user._id, role: user.role });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res, next) => {
  try {
    res.json({ user: req.user });
  } catch (err) {
    next(err);
  }
};

export default { register, login, me };
