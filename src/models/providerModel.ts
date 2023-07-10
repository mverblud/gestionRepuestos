import { model, Schema } from "mongoose";
import { IProvider } from "../interfaces/provider.interface";

const providerSchema = new Schema<IProvider>(
  {
    name: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    nameShort: { type: String },
    address: { type: String },
    phoneNumber: { type: String },
    emailAddress: { type: String },
  },
  { timestamps: true }
);

export default model<IProvider>("Provider", providerSchema);
