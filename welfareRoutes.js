const express = require("express")
const Welfare = require("./models/Welfare.models")
const jwt = require("jsonwebtoken")





let welfareRoutes = express.Router();


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


module.exports = welfareRoutes

