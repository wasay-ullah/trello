import express from "express";
import connection from "../config/connect_db.js";
import UserModel from "../models/models.js";
import { sequelize } from "../config/connect_db.js";

const router = express.Router();
const User = sequelize.models.User || UserModel(sequelize);

router.post("/login", async (req, res) => {
  try {
    await connection();
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }
    const user = await User.findOne({ where: { email, password } });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    } 
    req.session.user = { id: user.id, email: user.email };
    res.status(200).json({ message: "Login successful", username: user.name });
    console.log("User logged in:", req.session.user);
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({ message: "Unable to log out" });
    }

    res.clearCookie("connect.sid");
    return res.status(200).json({ message: "Logout successful" });
  });
});

export default router;