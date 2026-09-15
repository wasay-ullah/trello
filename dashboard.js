import express from "express";
const router = express.Router();

function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }

  res.status(401).json({ message: "Authentication required" });
}

router.get("/dashboard", isAuthenticated, (req, res) => {
  res.status(200).json({ message: `Welcome to the dashboard, ${req.session.user.email}` });
});

export default router;