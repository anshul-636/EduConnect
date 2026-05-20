const { verifyToken } = require("../utils/jwt");
const prisma = require("../utils/prisma");

/**
 * Protects routes by verifying the Bearer JWT token.
 * Attaches the full user object to req.user on success.
 *
 * Usage: router.get("/me", protect, controller)
 */
const protect = async (req, res, next) => {
  try {
    // 1. Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Please login first.",
      });
    }

    const token = authHeader.split(" ")[1];

    // 2. Verify token
    const payload = verifyToken(token);
    if (!payload || payload.type !== "access") {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token. Please login again.",
      });
    }

    // 3. Check user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        schoolId: true,
        isActive: true,
        createdAt: true,
        school: {
          select: {
            name: true,
            location: true,
            affiliation: true,
          }
        }
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User not found or account deactivated.",
      });
    }

    // 4. Attach user to request for downstream use
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { protect };
