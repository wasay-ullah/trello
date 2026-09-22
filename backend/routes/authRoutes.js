import express from "express";
import connection from "../config/connect_db.js";
import UserModel from "../models/models.js";
import { sequelize } from "../config/connect_db.js";

const router = express.Router();
const User = UserModel(sequelize);

router.post("/register", async (req, res) => {
  try {
    await connection();
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: "name, email, and password are required" });
    }

    const normalizedEmail = email.trim();
    const existingUser = await User.findOne({ where: { email: normalizedEmail } });
    if (existingUser) {
      return res.status(409).json({ message: "You already have an account with this email" });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    return res.status(201).json({ message: "user created successfully", username: user.name });
  } catch (error) {
    console.error("Registration failed:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ message: "You already have an account with this email" });
    }
    return res.status(500).json({ message: "Unable to create your account" });
  }
});

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
    return res.status(200).json({ message: "Login successful", username: user.name });
  } catch (error) {
    console.error("Login failed:", error);
    return res.status(500).json({ message: error.message });
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