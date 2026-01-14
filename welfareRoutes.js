import express from "express";
import Welfare from "./models/Welfare.models.js";
import jwt from "jsonwebtoken";





let welfareRoutes = express.Router();




// create welfare members 


/**
 * @openapi
 * /welfare:
 *   post:
 *     summary: Create a welfare record
 *     description: Creates a new welfare record with member name details. Requires a valid JWT token.
 *     tags:
 *       - Welfare
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: John
 *               last_name:
 *                 type: string
 *                 example: Doe
 *     responses:
 *       201:
 *         description: Welfare record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Saved
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 64f3a1b2c1234567890abcd
 *                     name:
 *                       type: object
 *                       properties:
 *                         first_name:
 *                           type: string
 *                           example: John
 *                         last_name:
 *                           type: string
 *                           example: Doe
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Server error
 */

welfareRoutes.post("/", verifyToken, async (req, res) => {

    try {
        
        const newMember = await Welfare.create({
            name:{
                
                first_name: req.body.first_name,
                last_name: req.body.last_name,
            }
            
        });

        return res.status(201).json({
            message: "Saved",
            data: newMember,
        });
        
    } catch (err) {
        console.error("WRITE ERROR:", err);
        return res.status(500).json({ message: err.message });
    }
});



// get welfare members 

/**
 * @openapi
 * /welfare:
 *   get:
 *     summary: Get all welfare records
 *     description: Retrieves all welfare records. Requires a valid JWT token.
 *     tags:
 *       - Welfare
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Welfare records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: 64f2c1e9a1234567890abcd
 *                   member_id:
 *                     type: string
 *                     example: 64f2b8d4e1234567890abcd
 *                   amount:
 *                     type: number
 *                     example: 100
 *                   description:
 *                     type: string
 *                     example: Monthly welfare support
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: 2024-01-10T12:00:00Z
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Server error
 */

welfareRoutes.get("/",verifyToken, async (req, res) => {

    try {
        const members = await Welfare.find();
        return res.status(200).json(members);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
      
});



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
        
        next()
    })
}


export default welfareRoutes;

