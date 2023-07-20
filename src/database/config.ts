import mongoose from "mongoose";
import { LogLevel, logger } from "../helpers/logger";

const connectDb = async (): Promise<void> => {
  try {
    const url = process.env.MONGO_URI ?? "mongodb://localhost:27017/ov-db";
    await mongoose.connect(url);
    logger("connectDb", `Connection to MongoDB success: ${url}`, LogLevel.INFO);
  } catch (error) {
    logger("connectDb", error, LogLevel.ERROR);
    process.exit(1);
  }
};

export default connectDb;
