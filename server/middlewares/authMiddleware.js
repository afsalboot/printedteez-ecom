const jwt = require("jsonwebtoken");
const User = require("../models/User.js");

const protected = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (user.blocked) {
      return res.status(403).json({ message: "User is blocked" });
    }
    req.user = { id: user._id, role: user.role };
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Unauthorized", error: err.message });
  }
};

const optionalProtected = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return next();

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (user && !user.blocked) {
      req.user = { id: user._id, role: user.role };
    }
  } catch {}

  return next();
};

module.exports = protected;
module.exports.optionalProtected = optionalProtected;
