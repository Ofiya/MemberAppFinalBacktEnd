const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid')



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

module.exports = mongoose.model("Users", usersSchema);