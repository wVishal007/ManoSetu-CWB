import "dotenv/config"
import mongoose from 'mongoose';
const dbURI = process.env.MONGODB_URI

const connectDB = async () => {
  try {
    console.log(dbURI);
    console.log(process.env.PORT);
    
    await mongoose.connect(dbURI);
    console.log(`🍃 MongoDB connected`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDB;