const mongoose = require("mongoose")
const { v4: uuidv4 } = require('uuid')
const Member = require("./Members.model")
const Service = require("./services.models")



const attendanceSchema = new mongoose.Schema(
    {
        uuid:{
            type:String,
            default:uuidv4,
            unique:true
        },
        
        date:{
            type:String,
            required:true,
            unique:true
        },
       
        present:{
            type:Map,
            of:Boolean,
            default:{},
        }
        
      
    },
    {
        collection: "attendance",
    }
    
)


module.exports = mongoose.model("Attendance", attendanceSchema)