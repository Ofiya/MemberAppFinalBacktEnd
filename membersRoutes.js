const express = require('express');
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
require("dotenv").config({path: "./config.env"});
const memberModel = require("./models/Members.model.js")
const housholdModel = require("./models/Household.models.js")





let membersRoutes = express.Router();



//get one member 
membersRoutes.get("/detail/:uuid", verifyToken, async (req, res) => {
    
    const member = await memberModel.findOne({ uuid: req.params.uuid });

    res.json(member);
});


// Retrieve all members 
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


membersRoutes.patch("/:uuid", verifyToken, async (req, res) => {
   
    try {
        
        const updated = await memberModel.findOneAndUpdate(
            { uuid:req.params.uuid },
            { $set:req.body },
            { new:true }
        );
        console.log("UPDATED DOC:", updated);

        if (!updated) {
            return res.status(404).json({ message: "Not found" });
        }

        res.json(updated);
        
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


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



module.exports = membersRoutes