import mongoose from "mongoose";
import dotenv from "dotenv"
dotenv.config()


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.ATLAS_URI)
        console.log("MONGODB CONNECTED")
        console.log("Connected DB:", mongoose.connection.name)
    } catch (err) {
        console.error("MONGODB CONNECTION FAILED", err.message )
        process.exit(1)
    }
};

export default connectDB;