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
userRoutes.get("/", verifyToken, async (req, res) => {

    try {
        const users = await userModel.find();
        return res.status(200).json(users);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

})



// Add a user

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

    const resetLink = `http://localhost:5173/reset-password?token=${token}`;

    await sendAMail(email, resetLink);

    res.json({ ok: true });
});



// reset password 
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