import mongoose from 'mongoose'

const connectDb = async (): Promise<void> => {
  try {
    const url = process.env.MONGO_URI ?? 'mongodb://localhost:27017/ov-db'
    await mongoose.connect(url)
    console.log(`⚡️[server]: Connection to MongoDB success: ${url}`)
  } catch (error: unknown) {
    if (typeof error === 'string') {
      console.log(`Error: ${error}`)
    } else if (error instanceof Error) {
      const e: Error = error
      console.log(`Error name: ${e.name}, ${e.message}`)
      process.exit(1)
    }
  }
}

export default connectDb
