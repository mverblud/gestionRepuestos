import { model, Schema } from "mongoose";
import { ICategory } from "../interfaces/category.interface";

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    status: { type: Boolean, default: true },
    enabled: { type: Boolean, default: true },
    image: { type: String, default: "" },
  },
  { timestamps: true }
);

/*
CategoriaSchema.methods.toJSON = function () {
  const { __v, ...categoria } = this.toObject()
  return categoria
} */

export default model<ICategory>("Category", categorySchema);
