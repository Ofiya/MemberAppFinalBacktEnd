import mongoose from "mongoose";


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

export default mongoose.model("resetToken", resetTokenSchema);