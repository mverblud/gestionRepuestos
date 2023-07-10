import dotenv from "dotenv";
import connectDb from "../database/config";
import categoryModel from "../models/categoryModel";
import carBrandModel from "../models/carBrandModel";
import carBrands from "./carBrands";
import categories from "./categories";
import productBrandModel from "../models/productBrandModel";
import productBrand from "./productBrands";
import cloudinary from "../config/cloudinaryConfig";
import providerModel from "../models/providerModel";
import providers from "./providres";

dotenv.config();

const importData = async (): Promise<void> => {
  try {
    // conexion a la BD
    await connectDb();
    await Promise.all([
      categoryModel.insertMany(categories),
      carBrandModel.insertMany(carBrands),
      productBrandModel.insertMany(productBrand),
      providerModel.insertMany(providers),
    ]);
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
    await Promise.all([
      categoryModel.deleteMany(),
      carBrandModel.deleteMany(),
      productBrandModel.deleteMany(),
      providerModel.deleteMany(),
    ]);
    console.log("Data deleted successfully");
    process.exit(1);
  } catch (error: unknown) {
    console.log(error);
    process.exit(1);
  }
};

const deleteAllCloudinary = async (): Promise<void> => {
  try {
    await Promise.all([
      cloudinary.api.delete_all_resources(),
      cloudinary.api.delete_folder("ov"),
    ]);
    console.log("Se limpio Cloudinary");
    process.exit(1);
  } catch (error: unknown) {
    console.log("Se Produjo un error: ", error);
    process.exit(1);
  }
};

if (process.argv[2] === "-i") {
  void importData();
}

if (process.argv[2] === "-e") {
  void deleteData();
}

if (process.argv[2] === "-c") {
  void deleteAllCloudinary();
}
