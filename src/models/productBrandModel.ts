import { model, Schema } from "mongoose";
import { IProductBrand } from "../interfaces/productBrand.interface";

const productBrandSchema = new Schema<IProductBrand>(
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

export default model<IProductBrand>("ProductBrand", productBrandSchema);
