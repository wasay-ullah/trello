import express from "express";
import connection, { sequelize } from "../config/connect_db.js";
import User_m from "../models/models.js";
import session from "express-session";
import loginRouter from "./login.js";
import dashboardRouter from "./dashboard.js";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(session({
  secret: "your-secret-key",
  resave: false,
  saveUninitialized: true,
  cookie:{
    maxAge: 1000 * 60 * 60, 
  } 
}));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true, 
}));



export const User =User_m(sequelize);
app.use(loginRouter);
app.use(dashboardRouter);

app.get("/login", (req, res) => {
  res.status(200).json({ message: "Send a POST request with email and password to log in" });
});

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






const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


export default app;
export { app };