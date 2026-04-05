import mongoose from 'mongoose';

const connectDB = async (): Promise<typeof mongoose> => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }
    
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    } as mongoose.ConnectOptions);
    
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`Error connecting to MongoDB: ${errorMsg}`);
    process.exit(1);
  }
};

export default connectDB;
