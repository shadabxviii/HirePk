// import mongoose from "mongoose";

// const connectDB = async () => {
//   // let mongoURI = process.env.MONGODB_URI;
//   try {
//     // const conn = await mongoose.connect(mongoURI);
//     const conn = await mongoose
//       .connect(process.env.MONGODB_URI, {
//         connectTimeoutMS: 30000, // 30 seconds wait karega connection ka
//         socketTimeoutMS: 45000,
//       })
//       .then(() => console.log("MongoDB Connected..."))
//       .catch((err) => console.log("Error: ", err));
//     console.log(`MongoDB Connected: ${conn.connection.host}`);
//   } catch (error) {
//     console.error(`MongoDB Connection Error: ${error.message}`);
//     process.exit(1);
//   }
// };

// export default connectDB;


import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";

// Use Google DNS to prevent querySrv ECONNREFUSED on routers that don't support SRV DNS TCP fallback properly
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Ensure karein ki dotenv config ho chuka ho taake process.env kaam kare
dotenv.config(); 

const connectDB = async () => {
  try {
    // Agar environment variable nahi mil raha to error throw karein
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in your environment variables!");
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      connectTimeoutMS: 30000, 
      socketTimeoutMS: 45000,
    });

    // Jab await use ho raha ho, to success direct is line par aayegi
    console.log(`MongoDB Connected Successfully: ${conn.connection.host}`);
    
  } catch (error) {
    // Agar connection fail hota hai (jaise ECONNREFUSED), to wo is catch block me aayega
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Process ko rok dega
  }
};

export default connectDB;