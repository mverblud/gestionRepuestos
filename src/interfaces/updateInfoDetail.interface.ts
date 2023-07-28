import { Types } from "mongoose";

export interface IUpdateInfoDetail {
  updateInfo: Types.ObjectId;
  product: Types.ObjectId;
  previousPrice: number;
  newPrice: number;
  priceDifference: number;
  pricePercentageIncrease: number;
}
