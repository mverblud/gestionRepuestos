import dotenv from "dotenv";
import connectDb from "../database/config";
import Category from "../models/categoryModel";
import categories from "./categories";
//import cloudinary from "../config/cloudinaryConfig";

dotenv.config();

const importData = async (): Promise<void> => {
  try {
    // conexion a la BD
    await connectDb();
    await Promise.all([Category.insertMany(categories)]);
    console.log("Data imported successfully");
    process.exit(1);
  } catch (error: unknown) {
    console.log(error);
    process.exit(1);
  }
};

const deleteData = async (): Promise<void> => {
  try {
    // conexion a la BD
    await connectDb();
    await Promise.all([Category.deleteMany()]);
    console.log("Data deleted successfully");

    //const response = await cloudinary.api.delete_all_resources();
    //console.log(response);

    process.exit(1);
  } catch (error: unknown) {
    console.log(error);
    process.exit(1);
  }
};

if (process.argv[2] === "-i") {
  void importData();
}

if (process.argv[2] === "-e") {
  void deleteData();
}
