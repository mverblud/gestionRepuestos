import { model, Schema } from "mongoose";
import { ICarBrand } from "../interfaces/carBrand.interface";

const carBrandSchema = new Schema<ICarBrand>(
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

export default model<ICarBrand>("CarBrand", carBrandSchema);
