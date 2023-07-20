import carBrandModel from "../models/carBrandModel";
import categoryModel from "../models/categoryModel";
import productBrandModel from "../models/productBrandModel";
import productModel from "../models/productModel";
import providerModel from "../models/providerModel";

const existsCategory = async (id: string): Promise<void> => {
  const categoryExists = await categoryModel.findById(id);
  if (!categoryExists) {
    throw new Error(`The id does not exist: ${id}`);
  }
};

const existsCarBrand = async (id: string): Promise<void> => {
  const carBrandExists = await carBrandModel.findById(id);
  if (!carBrandExists) {
    throw new Error(`The id does not exist: ${id}`);
  }
};

const existsProductBrand = async (id: string): Promise<void> => {
  const productBrandExists = await productBrandModel.findById(id);
  if (!productBrandExists) {
    throw new Error(`The id does not exist: ${id}`);
  }
};

const existsProvider = async (id: string): Promise<void> => {
  const providerExists = await providerModel.findById(id);
  if (!providerExists) {
    throw new Error(`The id does not exist: ${id}`);
  }
};

const existsProduct = async (id: string): Promise<void> => {
  const productExists = await productModel.exists({ _id: id });
  if (!productExists) {
    throw new Error(`The id does not exist: ${id}`);
  }
};

export {
  existsCategory,
  existsCarBrand,
  existsProductBrand,
  existsProvider,
  existsProduct,
};
