import express from "express"
import HouseholdModel from "./models/Household.models.js"
import jwt from "jsonwebtoken"



let householdRoutes = express.Router()



/**
 * @openapi
 * /household:
 *   get:
 *     summary: Get all households
 *     description: Retrieves a list of all households. Requires a valid JWT token.
 *     tags:
 *       - Household
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Households retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: 64f4b2a1c1234567890abcd
 *                   household:
 *                     type: object
 *                     properties:
 *                       first_name:
 *                         type: string
 *                         example: John
 *                       last_name:
 *                         type: string
 *                         example: Doe
 *                   uuid:
 *                     type: string
 *                     example: 7a9b2c10-4e3d-4a8b-9f12-abcdef123456
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: 2024-01-10T12:00:00Z
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Server error
 */

householdRoutes.get("/", verifyToken, async (req, res) => {

    try {
        const household = await HouseholdModel.find();
        return res.status(200).json(household);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
      
});



// create welfare members 

householdRoutes.post("/add_household", verifyToken, async (req, res) => {

    const existing = HouseholdModel.findOne({last_name:req.body.last_name})
    
    try {

        if(!existing){

            const newMember = await HouseholdModel.create({
                household:{
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                }
                
            });
        }else{
            return res.status(409).json({
                message:"Household already exist"
            })
        }
        

        return res.status(201).json({
            message: "Saved",
        });
        
    } catch (err) {
        console.error("WRITE ERROR:", err);
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
        // request.body.user = user
        next()
    })
}



export default householdRoutes