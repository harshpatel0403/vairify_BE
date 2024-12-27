import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("mongodb connection success!");
    } catch (err) {
        console.log("mongodb connection failed!", err.message);
    }
};

export default connectDB;
