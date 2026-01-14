import mongoose from "mongoose"
import { v4 as uuidv4 } from "uuid"




const householdSchema = new mongoose.Schema(
    {
        uuid:{
            type:String,
            default:uuidv4,
            unique:true
        },
        household:{
            first_name:{type:String},
            last_name:{type:String}
        },
      
    },
    {
        collection: "households",
    }
    
)


export default mongoose.model("Household", householdSchema)