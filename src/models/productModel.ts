import { model, Schema } from "mongoose";
import { IProduct } from "../interfaces/product.interface";

const productSchema = new Schema<IProduct>(
  {
    code: {
      type: String,
      required: [true, "The code is required"],
      trim: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "The name is required"],
      trim: true,
      uppercase: true,
      index: true,
    },
    description: { type: String },
    productBrand: {
      type: Schema.Types.ObjectId,
      ref: "ProductBrand",
    },
    carBrand: {
      type: Schema.Types.ObjectId,
      ref: "CarBrand",
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    provider: {
      type: Schema.Types.ObjectId,
      ref: "Provider",
    },
    stock: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    priceIVA: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    finalPrice: { type: Number, default: 0 },
    enabled: { type: Boolean, default: true },
    status: { type: Boolean, default: true },
    image: { type: String, default: "" },
  },
  { timestamps: true }
);

export default model<IProduct>("Product", productSchema);
