const mongoose = require("mongoose");


const resetTokenSchema = new mongoose.Schema({
    email: {
        type:String
    },
    resetToken:{
        type:String
    },
    resetTokenExpiry:{
        type:String
    }
});

module.exports = mongoose.model("resetToken", resetTokenSchema);