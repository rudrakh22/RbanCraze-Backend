const jwt=require('jsonwebtoken');


exports.admin = async (req, res, next) => {
  try {
    const token = req.body.token || req.header('Authorization')?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized access' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.email !== process.env.ADMIN_EMAIL) {
      return res.status(403).json({ success: false, message: 'Not authorized. Please login again.' });
    }

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "JWT expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    console.error("Unexpected token error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
