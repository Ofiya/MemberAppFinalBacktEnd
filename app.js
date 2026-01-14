import dotenv from "dotenv"
dotenv.config()
import connectDB from "./db.js";
import express from "express";
import mongoose from "mongoose";
import {setupSwagger} from "./swagger.js"


import cors from "cors";
import membersRoutes from "./membersRoutes.js";
import usersRoutes from "./userRoutes.js";
import welfareRoutes from "./welfareRoutes.js";
import householdRoutes from "./householdRoutes.js";
import attendanceRoutes from "./attendanceRoutes.js";
import emailRoute from "./emailRoute.js";


const app = express();
const PORT = 3000;


app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://memapp.cccredemptionwpg.org",
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/members", membersRoutes)
app.use("/users", usersRoutes)
app.use("/welfare",welfareRoutes)
app.use("/household", householdRoutes)
app.use("/attendance", attendanceRoutes)
app.use("/email", emailRoute)


setupSwagger(app);


connectDB();

app.listen(process.env.PORT || 3000, () => {
  console.log("Server Started");
  console.log("DB STATE:", mongoose.connection.readyState);
});


