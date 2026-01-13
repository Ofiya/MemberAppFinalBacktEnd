const mongoose = require("mongoose")
const { v4: uuidv4 } = require('uuid')




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


module.exports = mongoose.model("Household", householdSchema)