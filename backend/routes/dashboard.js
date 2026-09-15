import express from "express";
import {User} from "../register.js";
import isAuthenticated from "../middleware/authenticate.js";

const router = express.Router();

router.get("/dashboard", isAuthenticated, async(req, res) => {
  const user= await User.findByPk(req.session.user.id);
  res.status(200).json({ message: `Welcome to the dashboard , ${user.name}` });
});

export default router;