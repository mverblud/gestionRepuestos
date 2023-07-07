import carBrandModel from "../models/carBrandModel";
import categoryModel from "../models/categoryModel";

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

export { existsCategory, existsCarBrand };
