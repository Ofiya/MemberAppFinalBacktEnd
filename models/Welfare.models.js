const mongoose = require("mongoose")
const { v4: uuidv4 } = require('uuid')


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

module.exports = mongoose.model("Welfare", welfareSchema)