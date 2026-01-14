import mongoose from "mongoose"
import { v4 as uuidv4 } from 'uuid'


const welfareSchema = new mongoose.Schema(
    {
        uuid:{
            type:String,
            default:uuidv4,
            unique:true
        },
        name:{
            first_name:{type:String},
            last_name:{type:String}
        },
      
    },
    {
        collection: "welfare_members",
    }
    
)

export default mongoose.model("Welfare", welfareSchema)