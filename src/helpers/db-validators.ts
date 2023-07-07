import categoryModel from "../models/categoryModel";

const existsCategory = async (id: string): Promise<void> => {
  const categoryExists = await categoryModel.findById(id);
  if (!categoryExists) {
    throw new Error(`The id does not exist: ${id}`);
  }
};

export default existsCategory;
