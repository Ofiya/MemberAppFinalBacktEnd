import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import Member from "./Members.model.js";
import Service from "./services.models.js";



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


export default mongoose.model("Attendance", attendanceSchema);
