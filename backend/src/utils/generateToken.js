import { signToken } from "../config/jwt.js";
export default (user) => signToken({ id: user._id, role: user.role });
