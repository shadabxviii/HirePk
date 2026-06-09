import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";

// Use Google DNS to prevent querySrv ECONNREFUSED
dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config(); 

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in your environment variables!");
    }

    // FIX: dbName options ke andar lazmi pass karein
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "MY_DATABASE", // <--- Yeh line aapka data website par wapas le aayegi
      connectTimeoutMS: 30000, 
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB Connected Successfully to: ${conn.connection.name} on ${conn.connection.host}`);
    
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1); 
  }
};

export default connectDB;