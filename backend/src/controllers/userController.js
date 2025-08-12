import User from "../models/userModel.js";

export const getUsers = async (req, res, next) => {
  try {
  const users = await User.find().select("-passwordHash");
    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const getUser = async (req, res, next) => {
  try {
  const user = await User.findById(req.params.id).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export default { getUsers, getUser };
