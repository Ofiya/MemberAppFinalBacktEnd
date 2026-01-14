import dotenv from "dotenv"
dotenv.config({path: "./config.env"});
import express from 'express';
import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import memberModel from "./models/Members.model.js"
import housholdModel from "./models/Household.models.js"





let membersRoutes = express.Router();



//get one member

/**
 * @openapi
 * /members/detail/{uuid}:
 *   get:
 *     summary: Get member details by UUID
 *     description: Retrieves full details of a single member using their UUID. Requires a valid JWT token.
 *     tags:
 *       - Members
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique UUID of the member
 *         example: 3f6c2a10-9b4e-4d7a-9f8a-123456789abc
 *     responses:
 *       200:
 *         description: Member retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Member object
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       404:
 *         description: Member not found
 *       500:
 *         description: Server error
 */

membersRoutes.get("/detail/:uuid", verifyToken, async (req, res) => {
    
    const member = await memberModel.findOne({ uuid: req.params.uuid });

    res.json(member);
});


// Retrieve all members

/**
 * @openapi
 * /members:
 *   get:
 *     summary: Get members with pagination
 *     description: >
 *       Retrieves a paginated list of members.
 *       Requires a valid JWT token.
 *     tags:
 *       - Members
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Number of records per page
 *         example: 10
 *     responses:
 *       200:
 *         description: Members retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   description: Paginated members
 *                   items:
 *                     type: object
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 totalMembers:
 *                   type: integer
 *                   example: 42
 *                 allMembers:
 *                   type: array
 *                   description: All members (unpaginated)
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Server error
 */

membersRoutes.get("/", verifyToken, async (req, res) => {

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    try {

        const members = await memberModel.find().skip(skip).limit(limit);
        
        const total = await memberModel.countDocuments()
        const allMembers = await memberModel.find();

        return res.status(200).json({
            data:members,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            totalMembers: total,
            allMembers: allMembers
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

})



// Add a member

/**
 * @openapi
 * /members:
 *   post:
 *     summary: Create a new member
 *     description: >
 *       Creates a new member record. If the household field includes "new",
 *       a new household is created in a transaction before creating the member.
 *       Requires a valid JWT token.
 *     tags:
 *       - Members
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
 *               - email
 *               - household
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: John
 *               last_name:
 *                 type: string
 *                 example: Doe
 *               dob:
 *                 type: string
 *                 format: date
 *                 example: 1990-05-20
 *               gender:
 *                 type: string
 *                 example: Male
 *               phone_number:
 *                 type: string
 *                 example: "2045551234"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               immigration_status:
 *                 type: string
 *                 example: Permanent Resident
 *               doc_expiry:
 *                 type: string
 *                 format: date
 *                 example: 2026-12-31
 *               marital_status:
 *                 type: string
 *                 example: Married
 *               occupation:
 *                 type: string
 *                 example: Software Developer
 *               address:
 *                 type: string
 *                 example: 123 Main St, Winnipeg
 *               household:
 *                 type: string
 *                 description: >
 *                   Use "new" to create a new household or provide an existing household UUID
 *                 example: new
 *               rank:
 *                 type: string
 *                 example: Member
 *               date_joined_church:
 *                 type: string
 *                 format: date
 *                 example: 2023-01-15
 *               assigned_welfare_member:
 *                 type: string
 *                 example: welfare_uuid_123
 *               note:
 *                 type: string
 *                 example: Active and participating
 *               account_status:
 *                 type: string
 *                 example: Active
 *               date_created:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-01-10T10:00:00Z
 *     responses:
 *       201:
 *         description: Member created successfully
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
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       409:
 *         description: Member already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Member already exists
 *       500:
 *         description: Server error
 */

membersRoutes.post("/", verifyToken, async (req, res) => {
    
    const existingMember = await memberModel.findOne({email:req.body.email });

    if (existingMember) {
      return res.status(409).json({
        message: "Member already exists",
      });
    }

    const session = await mongoose.startSession()
    session.startTransaction()
    
    if(req.body.household.includes("new")){

        
        try {
            

            const householdData = await housholdModel.create([
                {household:{
                    first_name:req.body.first_name,
                    last_name:req.body.last_name
                }},
                
            ], {session});
        
            
            await memberModel.create([ 
            
                {
                    name:{
                        first_name:req.body.first_name,
                        last_name:req.body.last_name,
                    },
                    dob:req.body.dob,
                    gender:req.body.gender,
                    phone_number:req.body.phone_number,
                    email:req.body.email,
                    immigration_status:req.body.immigration_status,
                    doc_expiry:req.body.doc_expiry,
                    marital_status:req.body.marital_status,
                    occupation:req.body.occupation,
                    address:req.body.address,
                    household:householdData[0].uuid,
                    rank:req.body.rank,
                    date_joined_church:req.body.date_joined_church,
                    assigned_welfare_member:req.body.assigned_welfare_member,
                    note:req.body.note,
                    date_created:req.body.date_created,
                    date_updated:req.body.date_created

                }

            ], {session});

            await session.commitTransaction();
            session.endSession();
            return res.status(201).json({ message: "Success" });

        } catch (err) {
            await session.abortTransaction();
            session.endSession();

            return res.status(500).json({ message: err.message });
        }
    } else {

        try {
            const newMember =  await memberModel.create({ 
            
                name:{
                    first_name:req.body.first_name,
                    last_name:req.body.last_name,
                },
                dob:req.body.dob,
                gender:req.body.gender,
                phone_number:req.body.phone_number,
                email:req.body.email,
                immigration_status:req.body.immigration_status,
                doc_expiry:req.body.doc_expiry,
                marital_status:req.body.marital_status,
                occupation:req.body.occupation,
                address:req.body.address,
                household:req.body.household,
                rank:req.body.rank,
                date_joined_church:req.body.date_joined_church,
                assigned_welfare_member:req.body.assigned_welfare_member,
                note:req.body.note,
                account_status:req.body.account_status,
                date_created:req.body.date_created,
                date_updated:req.body.date_created

            });

            return res.status(201).json({
            message: "Saved",
            data: newMember,
            });
            
        } catch (err) {
            console.error("WRITE ERROR:", err);
            return res.status(500).json({ message: err.message });
        }

    }

    


});



// update member information 

/**
 * @openapi
 * /members/{uuid}:
 *   patch:
 *     summary: Update a member by UUID
 *     description: Partially updates a member’s details using their UUID. Requires a valid JWT token.
 *     tags:
 *       - Members
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique UUID of the member
 *         example: 3f6c2a10-9b4e-4d7a-9f8a-123456789abc
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Fields to update (partial updates allowed)
 *             example:
 *               first_name: John
 *               last_name: Doe
 *               phone_number: "1234567890"
 *               address: 123 Main St
 *     responses:
 *       200:
 *         description: Member updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       404:
 *         description: Member not found
 *       400:
 *         description: Bad request / validation error
 */

membersRoutes.patch("/:uuid", verifyToken, async (req, res) => {
   
    try {
        
        const updated = await memberModel.findOneAndUpdate(
            { uuid:req.params.uuid },
            { $set:req.body },
            { new:true }
        );
        

        if (!updated) {
            return res.status(404).json({ message: "Not found" });
        }

        res.json(updated);
        
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});



// member updates status

/**
 * @openapi
 * /members/member_update/{uuid}:
 *   patch:
 *     summary: Update a member by UUID
 *     description: Updates a member’s details using their UUID. Requires a valid JWT token.
 *     tags:
 *       - Members
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique UUID of the member
 *         example: 3f6c2a10-9b4e-4d7a-9f8a-123456789abc
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Fields to update (partial updates allowed)
 *             example:
 *               first_name: John
 *               last_name: Doe
 *               email: john@example.com
 *               phone_number: "1234567890"
 *     responses:
 *       200:
 *         description: Member updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       404:
 *         description: Member not found
 *       400:
 *         description: Bad request / validation error
 */

membersRoutes.patch("/member_update/:uuid", verifyToken, async (req, res) => {
   
    try {
        
        const updated = await memberModel.findOneAndUpdate(
            { uuid:req.params.uuid },
            { $set:req.body },
            { new:true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Not found" });
        }

        res.json(updated);
        
    } catch (err) {
        res.status(400).json({ message: err.message });
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



export default membersRoutes