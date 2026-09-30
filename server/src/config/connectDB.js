import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const { MONGODB_URI, DB_NAME } = process.env;

    if (!MONGODB_URI || !DB_NAME) {
      console.warn('MongoDB env vars missing (MONGODB_URI/DB_NAME). Skipping DB connection in this environment.');
      return;
    }

    const conn = await mongoose.connect(`${MONGODB_URI}/${DB_NAME}`);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    mongoose.connection.on('error', err => {
      console.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    throw error;
  }
};


export default connectDB;
