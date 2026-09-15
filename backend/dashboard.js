import express from "express";
import isAuthenticated from "./middleware/authenticate.js";

const router = express.Router();

router.get("/dashboard", isAuthenticated, (req, res) => {
  res.status(200).json({ message: `Welcome to the dashboard, ${req.session.user.email}` });
});

export default router;