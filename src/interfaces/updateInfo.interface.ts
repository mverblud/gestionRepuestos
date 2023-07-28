import { Types } from "mongoose";

export interface IUpdateInfo {
  fileName: string;
  productCount: number;
  provider: Types.ObjectId;
  user: string;
}
