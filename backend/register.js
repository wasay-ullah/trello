import "dotenv/config";
import express from "express";
import session from "express-session";
import authRouter from "./routes/authRoutes.js";
import boardRouter from "./routes/boardRoutes.js";
import cors from "cors";
import columnRouter from "./routes/columnRoutes.js";
import cardRoutes from "./routes/cardRoutes.js";
import labelRoutes from "./routes/labelRoutes.js";



const app = express();
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie:{
    maxAge: Number(process.env.SESSION_MAX_AGE),
  } 
}));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_ORIGINS.split(","),
  credentials: true, 
}));

app.use(authRouter);
app.use("/api/boards", boardRouter);
app.use('/api', columnRouter);
app.use('/api', cardRoutes);
app.use('/api', labelRoutes);

app.get("/login", (req, res) => {
  res.status(200).json({ message: "Send a POST request with email and password to log in" });
});

const port = Number(process.env.PORT);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


export default app;
export { app };