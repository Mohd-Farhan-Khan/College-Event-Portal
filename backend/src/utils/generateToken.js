const { signToken } = require("../config/jwt");
module.exports = (user) => signToken({ id: user._id, role: user.role });
