import { model, Schema } from "mongoose";
import { IUpdateInfo } from "../interfaces/updateInfo.interface";

const updateInfoSchema = new Schema<IUpdateInfo>(
  {
    fileName: {
      type: String,
      trim: true,
      uppercase: true,
    },
    productCount: { type: Number, default: 0 },
    provider: {
      type: Schema.Types.ObjectId,
      ref: "Provider",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default model<IUpdateInfo>("UpdateInfo", updateInfoSchema);
