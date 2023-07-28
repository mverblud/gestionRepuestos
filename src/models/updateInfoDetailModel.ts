import { model, Schema } from "mongoose";
import { IUpdateInfoDetail } from "../interfaces/updateInfoDetail.interface";

const updateInfoDetailSchema = new Schema<IUpdateInfoDetail>(
  {
    updateInfo: {
      type: Schema.Types.ObjectId,
      ref: "Provider",
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Provider",
    },
    previousPrice: { type: Number, default: 0 },
    newPrice: { type: Number, default: 0 },
    priceDifference: { type: Number, default: 0 },
    pricePercentageIncrease: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default model<IUpdateInfoDetail>(
  "UpdateInfoDetail",
  updateInfoDetailSchema
);
