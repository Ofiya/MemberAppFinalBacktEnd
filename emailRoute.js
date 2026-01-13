const express = require('express');
const jwt = require("jsonwebtoken")
const nodemailer = require("nodemailer");
const memberModel = require("./models/Members.model")





let emailRoute = express.Router()

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

module.exports = emailRoute



