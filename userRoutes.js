const express = require('express');
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config({path: "./config.env"});
const userModel = require("./models/Users.models")
const sendAMail = require("./sendAMail")
const crypto = require("crypto")
const resTokenModel = require("./models/resetToken.models")

const SALT_ROUNDS = 6

let userRoutes = express.Router();


// get users 

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Returns a list of all users. Requires a valid JWT token.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: 64f1c2a9e1234567890abcd
 *                   fullname:
 *                     type: string
 *                     example: John Doe
 *                   email:
 *                     type: string
 *                     example: john@example.com
 *                   role:
 *                     type: string
 *                     example: Admin
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Server error
 */
userRoutes.get("/", verifyToken, async (req, res) => {

    try {
        const users = await userModel.find();
        return res.status(200).json(users);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

})



// Add a user

/**
 * @openapi
 * /users:
 *   post:
 *     summary: Create a new user
 *     description: Creates a new user account. Requires a valid JWT token.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullname
 *               - email
 *               - password
 *               - role
 *             properties:
 *               fullname:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongPassword123
 *               role:
 *                 type: string
 *                 example: User
 *               view_members:
 *                 type: boolean
 *                 example: true
 *               manage_attendance:
 *                 type: boolean
 *                 example: false
 *               manage_users:
 *                 type: boolean
 *                 example: false
 *               system_settings:
 *                 type: boolean
 *                 example: false
 *               created_by:
 *                 type: string
 *                 example: admin_id
 *     responses:
 *       201:
 *         description: User created successfully
 *       200:
 *         description: Email already taken
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       500:
 *         description: Server error
 */

userRoutes.post("/", verifyToken, async (req, res) => {
    
    const takenEmail = await userModel.findOne({email:req.body.email})

    if(takenEmail){

        res.json({message: "email is taken!"})

    } else {

        const hash = await bcrypt.hash(req.body.password, SALT_ROUNDS)

        try {
            const newUser = await userModel.create({
                fullname:req.body.fullname,
                email:req.body.email,
                password:hash,
                role:req.body.role,
                permissions:{
                    view_members: req.body.view_members,
                    manage_attendance:req.body.manage_attendance,
                    manage_users:req.body.manage_users,
                    system_settings:req.body.system_settings
                },
                created_by:req.body.created_by
            });
            return res.status(201).json({
                message: "Saved",
                data: newUser,
            })
        } catch (err) {
            console.error("WRITE ERROR:", err);
            return res.status(500).json({ message: err.message });
        }

    }
})



// Create Admin 
/** 
* @openapi
 * /users/admin:
 *   post:
 *     summary: Create an admin or superuser
 *     description: Creates a new admin or superuser account. Only one Admin or Superuser is allowed.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullname
 *               - email
 *               - password
 *               - role
 *             properties:
 *               fullname:
 *                 type: string
 *                 example: Admin
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongPassword123
 *               role:
 *                 type: string
 *                 enum: [Admin, Superuser]
 *                 example: Admin
 *               view_members:
 *                 type: boolean
 *                 example: true
 *               manage_attendance:
 *                 type: boolean
 *                 example: true
 *               manage_users:
 *                 type: boolean
 *                 example: true
 *               system_settings:
 *                 type: boolean
 *                 example: true
 *               created_by:
 *                 type: string
 *                 example: system
 *     responses:
 *       201:
 *         description: Admin created successfully
 *       200:
 *         description: Email or role already taken
 *       500:
 *         description: Server error
 */

userRoutes.post("/admin", async (req, res) => {
    
    const takenEmail = await userModel.findOne({email:req.body.email})
    const adminTaken = await userModel.findOne({fullname:"Admin"})
    const superUserTaken = await userModel.findOne({role:"Superuser"})
    if(takenEmail || adminTaken || superUserTaken){

        res.json({message: "email is taken!"})

    } else {

        const hash = await bcrypt.hash(req.body.password, SALT_ROUNDS)

        try {
            const newUser = await userModel.create({
                fullname:req.body.fullname,
                email:req.body.email,
                password:hash,
                role:req.body.role,
                permissions:{
                    view_members: req.body.view_members,
                    manage_attendance:req.body.manage_attendance,
                    manage_users:req.body.manage_users,
                    system_settings:req.body.system_settings
                },
                created_by:req.body.created_by
            });
            return res.status(201).json({
                message: "Saved",
                data: newUser,
            })
        } catch (err) {
            console.error("WRITE ERROR:", err);
            return res.status(500).json({ message: err.message });
        }

    }
})


// login member 

/**
 * @openapi
 * /users/login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user using email and password and returns a JWT token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongPassword123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Invalid email or password
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

userRoutes.post("/login",async (req, res) => {

    const user = await userModel.findOne({email:req.body.email})
    
    
    if(user){
        const confirmation = await bcrypt.compare(req.body.password, user.password)

        if(confirmation){
            
            const token = jwt.sign({user:user}, process.env.SECRETKEY, {expiresIn: "30m"})

            res.json({success: true, token})

        } else {

            res.json({success: false, message: 'Incorrect email or password'})
        }

    } else {

        res.json({success: false, message:'User not found'})
    }

 
})

// reset password link 

/**
 * @openapi
 * /users/reset-link:
 *   post:
 *     summary: Send password reset link
 *     description: >
 *       Generates a password reset token and sends a reset link to the user's email.
 *       For security reasons, the response is always successful even if the email does not exist.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Reset link processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *       500:
 *         description: Server error
 */

userRoutes.post("/reset-link", async (req, res) => {
    const  email  = req.body.email;

    const user = await userModel.findOne({email});
    
    if (!user) return res.json({ ok: true });

    const token = crypto.randomBytes(32).toString("hex");
    
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000;

    await resTokenModel.create({
        email: email,
        resetToken: token,
        resetTokenExpiry: Date.now() + 3600000
    })

    const resetLink = `http://memapp.cccredemptionwpg.org/reset-password?token=${token}`;

    await sendAMail(email, resetLink);

    res.json({ ok: true });
});



// reset password 

/**
 * @openapi
 * /users/reset-password:
 *   post:
 *     summary: Reset user password
 *     description: >
 *       Resets a user's password using a valid reset token.
 *       The token must exist and must not be expired.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - token
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 example: NewStrongPassword123
 *               token:
 *                 type: string
 *                 example: 9f3c7a4e0b5d1e8c2a9f6b4d7e3c1a2f
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password updated
 *       400:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid or expired token
 *       500:
 *         description: Server error
 */

userRoutes.post("/reset-password", async (req, res) => {
  
    const { password, token } = req.body
    
    const user = await resTokenModel.findOne({
        resetToken: token,
        resetTokenExpiry: { $gt: Date.now() }
    });
    
    if (!user) {
        return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS)
    
    await userModel.findOneAndUpdate(
        { email:user.email },
        { $set:{password:hash} },
        { new:true }
    );

    await resTokenModel.deleteOne({resetToken: token})

    res.json({ message: "Password updated" });
});




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



module.exports = userRoutes