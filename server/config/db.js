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

    const connectOptions = {
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    };

    // Use explicit db name only when provided via env (otherwise URI default applies)
    if (process.env.MONGODB_DB_NAME) {
      connectOptions.dbName = process.env.MONGODB_DB_NAME;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, connectOptions);

    console.log(`MongoDB Connected Successfully to: ${mongoose.connection.name}`);
    
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1); 
  }
};

export default connectDB;



