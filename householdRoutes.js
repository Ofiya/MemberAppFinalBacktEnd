const express = require("express")
const HouseholdModel = require("./models/Household.models")
const jwt = require("jsonwebtoken")



let householdRoutes = express.Router()


householdRoutes.get("/", verifyToken, async (req, res) => {

    try {
        const household = await HouseholdModel.find();
        return res.status(200).json(household);
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
        // request.body.user = user
        next()
    })
}



module.exports = householdRoutes