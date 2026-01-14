import dotenv from "dotenv"
dotenv.config({ path: "./config.env" })
import express from "express";
import mongoose from "mongoose";
import database from "./db.js";
import jwt from "jsonwebtoken";
import attendanceModel from "./models/attendance.models.js";



let attendanceRoutes = express.Router();



/**
 * @openapi
 * /attendance:
 *   get:
 *     summary: Get attendance records
 *     description: Retrieves all attendance records sorted by most recent date. Requires a valid JWT token.
 *     tags:
 *       - Attendance
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendance records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: 64f5c2a1e1234567890abcd
 *                   date:
 *                     type: string
 *                     format: date
 *                     example: 2024-01-21
 *                   present:
 *                     type: object
 *                     additionalProperties:
 *                       type: boolean
 *                     example:
 *                       uuid-1: true
 *                       uuid-2: true
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: 2024-01-21T12:30:00Z
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Server error
 */

attendanceRoutes.get("/", verifyToken, async (req, res) => {

    try {
        const attendances = await attendanceModel.find({})
        .sort({ date: -1 });
        res.status(200).json(attendances);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
      
});



// update attendance 


/**
 * @openapi
 * /attendance:
 *   patch:
 *     summary: Create or update attendance by date
 *     description: >
 *       Creates a new attendance record for a date if none exists,
 *       or updates the existing attendance by marking additional members as present.
 *       Requires a valid JWT token.
 *     tags:
 *       - Attendance
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - presentMembers
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Attendance date
 *                 example: 2024-01-21
 *               presentMembers:
 *                 type: array
 *                 description: List of member UUIDs marked as present
 *                 items:
 *                   type: string
 *                 example:
 *                   - 3f6c2a10-9b4e-4d7a-9f8a-123456789abc
 *                   - 7a9b2c10-4e3d-4a8b-9f12-abcdef123456
 *     responses:
 *       201:
 *         description: Attendance record created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Newly created attendance record
 *       200:
 *         description: Attendance updated or unchanged
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Updated or existing attendance record
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Server error
 */

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




export default attendanceRoutes