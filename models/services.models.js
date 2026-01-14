import mongoose from "mongoose"
import { v4 as uuidv4 } from "uuid"



const servicesSchema = new mongoose.Schema(
    {
        uuid:{
            type:String,
            default:uuidv4,
            unique:true
        },
        service_date:{
            type:Date
        },
      
    },
    {
        collection: "services",
    }
    
)


export default mongoose.model("Services", servicesSchema)