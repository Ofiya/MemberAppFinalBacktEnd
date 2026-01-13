require("dotenv").config();
const connectDB = require("./db");
const express = require('express')
const mongoose = require("mongoose")



const cors = require('cors');
const memebersRoutes = require('./membersRoutes');
const usersRoutes =require("./userRoutes")
const welfareRoutes = require("./welfareRoutes")
const householdRoutes = require("./householdRoutes")
const attendanceRoutes = require("./attendanceRoutes")
const emailRoute = require("./emailRoute")


const app = express();
const PORT = 3000;




app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/members", memebersRoutes)
app.use("/users", usersRoutes)
app.use("/welfare",welfareRoutes)
app.use("/household", householdRoutes)
app.use("/attendance", attendanceRoutes)
app.use("/email", emailRoute)




connectDB().then( async () => {
  app.listen(PORT, () => console.log("Server started"));
  console.log("DB STATE:", mongoose.connection.readyState);
});






