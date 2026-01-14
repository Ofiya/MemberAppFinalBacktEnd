import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";



const usersSchema = new mongoose.Schema(
    {
        uuid:{
            type:String,
            default:uuidv4,
            unique:true
        },
        fullname:{
            type:String,
           
        },
        email: {
            type: String,
            lowercase:true
        },
        password:{
            type: String,
            select:true
            // required:true
        },
        role:{
            type:String,
            
        },
        permissions:{
            view_members:{
                type:String,
            },
            manage_attendance:{
                type:String,
            },
            manage_users:{
                type:String,
               
            },
            system_settings:{
                type:String,
                
            }
        },
        created_by:{
            type:String
        },
        
       
    },
    {
        collection: "users", 
    }
);

export default mongoose.model("Users", usersSchema);