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
  secret: "your-secret-key",
  resave: false,
  saveUninitialized: true,
  cookie:{
    maxAge: 1000 * 60 * 60, 
  } 
}));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
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

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


export default app;
export { app };