const express = require('express');
const mongoose = require("mongoose")
const database = require('./db.js')
const jwt = require("jsonwebtoken")
require("dotenv").config({path: "./config.env"});
const attendanceModel = require("./models/attendance.models.js")



let attendanceRoutes = express.Router();



attendanceRoutes.get("/", async (req, res) => {

    try {
        const attendances = await attendanceModel.find({})
        .sort({ date: -1 });
        res.status(200).json(attendances);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
      
});



// update attendance 
attendanceRoutes.patch("/", verifyToken, async (req, res) => {

    const { date, presentMembers } = req.body;

    try {

        const attendance = await attendanceModel.findOne({ date });

        if (!attendance) {
            const presentMap = {};

            presentMembers.forEach((uuid) => {
                presentMap[uuid] = true;
            });

            attendance = await attendanceModel.create({
                date,
                present: presentMap,
            });

            return res.status(201).json(attendance);
        }

        const existingPresent = attendance.present || new Map();

        const setOps = {};

        for (const uuid of presentMembers) {
            if (!existingPresent.has(uuid)) {
                setOps[`present.${uuid}`] = true;
            }
        }

        
        if (Object.keys(setOps).length === 0) {
            return res.status(200).json(attendance);
        }

        
        const updatedAttendance = await attendanceModel.findOneAndUpdate(
            { date },
            { $set: setOps },
            { new: true }
        );

        return res.status(200).json(updatedAttendance);

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

})


// verify user authentication at every request 
function verifyToken(request, response, next) {
    const authHeaders = request.headers["authorization"]
    const token = authHeaders && authHeaders.split(' ')[1]
    
    if(!token) {
        return response.status(401).json({message: "Authentication token is missing"})
    }
    jwt.verify(token, process.env.SECRETKEY, (error, user) => {
        if(error) {
            return response.status(403).json({message: "Invalid Token"})
        }
        // request.body.user = user
        next()
    })
}



module.exports = attendanceRoutes