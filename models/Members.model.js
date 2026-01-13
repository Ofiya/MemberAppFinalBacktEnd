const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid')
const Welfare = require("./Welfare.models")

const memberSchema = new mongoose.Schema(
    {
        uuid:{
            type:String,
            default:uuidv4,
            unique:true
        },
        name:{
            first_name:{type:String},
            last_name:{type:String},
            // required:true
        },
        email: {
            type: String,
            lowercase:true
        },
        dob:{
            type: Date,
            // required:true
        },
        gender:{
            type:String,
            // required:true
        },
        marital_status:{
            type:String,
            // required:true
        },
        household:{
            type:String,
        },
        occupation:{
            type:String,
            // required:true
        },
        phone_number:{
            type:String,
            // required:true,
            min:10,
            max:11
        },
        address:{
            type:String,
            // required:true,
            max:50
        },
        immigration_status:{
            type:String,
            // required:true
        },
        doc_expiry:{
            type:Date,
            // required:true
        },
        
        rank:{
            type:String,
        },
        date_joined_church:{
            type:Date,
            // required:true
        },
        
        note:{
            type:String,
            max:200
        },
        date_created:{
            type:Date,
            // default:Date.now
        },
        date_updated:{
            type:Date,
            // default:Date.now
        },
        assigned_welfare_member:{
            type:String,
            ref:Welfare
            // required:true
        },
        account_status:{
            type:String,
            default:"Active"
        },
       
    },
    {
        collection: "members", 
    }
);

module.exports = mongoose.model("Members", memberSchema);