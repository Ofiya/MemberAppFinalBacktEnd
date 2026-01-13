const mongoose = require("mongoose")
const { v4: uuidv4 } = require('uuid')



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


module.exports = mongoose.model("Services", servicesSchema)