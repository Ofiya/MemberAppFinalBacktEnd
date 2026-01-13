const mongoose = require("mongoose")
require("dotenv").config();


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.ATLAS_URI)
        console.log("MONGODB CONNECTED")
        console.log("Connected DB:", require("mongoose").connection.name)
    } catch (err) {
        console.error("MONGODB CONNECTION FAILED", err.message )
        process.exit(1)
    }
};

module.exports = connectDB