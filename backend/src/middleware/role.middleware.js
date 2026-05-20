/**
 * Restricts a route to users with specific roles.
 * Must be used AFTER the `protect` middleware (needs req.user).
 *
 * Usage:
 *   router.post("/events", protect, restrictTo("SCHOOL", "ADMIN"), createEvent)
 *   router.get("/admin", protect, restrictTo("ADMIN"), adminPanel)
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This action is only allowed for: ${roles.join(", ")}.`,
      });
    }
    next();
  };
};

module.exports = { restrictTo };
