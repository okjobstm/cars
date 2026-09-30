import mongoose from 'mongoose';

const connectDB = async () => {
  const { MONGODB_URI, DB_NAME } = process.env;

  if (!MONGODB_URI || !DB_NAME) {
    throw new Error('MongoDB env vars missing (MONGODB_URI/DB_NAME). Set them in Vercel env vars.');
  }

  const conn = await mongoose.connect(`${MONGODB_URI}/${DB_NAME}`, {
    serverSelectionTimeoutMS: 5000
  });

  console.log(`MongoDB Connected: ${conn.connection.host}`);

  mongoose.connection.on('error', err => {
    console.error(`MongoDB connection error: ${err}`);
  });
};

export default connectDB;
