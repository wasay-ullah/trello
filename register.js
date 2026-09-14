import express from "express";
import connection, { sequelize } from "./connect_db.js";
import User_m from "./models.js";

const app = express();
app.use(express.json());

const User = User_m(sequelize);
app.post("/register", async (req, res) => {
   try {
   await connection();
   const { name, email, password } = req.body;
 
   if (!name || !email || !password) {
     return res.status(400).json({ message: "name, email, and password are required" });
     }
   const user = await User.create({
     name, email, password
     });
 
   res.status(201).json({ message: "user created successfully", username: user.name });
 
   } catch (error) {
  res.status(500).json({ message: error.message });

   }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;