import express from "express";
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer";
import memberModel from"./models/Members.model.js";





let emailRoute = express.Router()


/**
 * @openapi
 * /email:
 *   post:
 *     summary: Send email to a member
 *     description: >
 *       Sends an email to a specific member identified by UUID.
 *       Requires a valid JWT token.
 *     tags:
 *       - Email
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - uuid
 *               - subject
 *               - message
 *             properties:
 *               uuid:
 *                 type: string
 *                 description: UUID of the member to email
 *                 example: 3f6c2a10-9b4e-4d7a-9f8a-123456789abc
 *               subject:
 *                 type: string
 *                 example: Important Announcement
 *               message:
 *                 type: string
 *                 example: Please note that the meeting has been rescheduled to Sunday.
 *     responses:
 *       200:
 *         description: Email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       404:
 *         description: Member not found
 *       500:
 *         description: Email sending failed
 */

emailRoute.post("/", verifyToken, async (req, res) => {

    const thisMember = await memberModel.findOne({uuid:req.body.uuid})
    
    const transporter =  nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    
    await transporter.sendMail({
        from: process.env.EMAIL,
        to:thisMember.email,
        subject:req.body.subject,
        text: req.body.message,
    });

    res.json({ success: true });
    
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

export default emailRoute;



