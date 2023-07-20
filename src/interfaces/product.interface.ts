import { Types } from "mongoose";

export interface IProduct {
  code: string;
  name: string;
  description?: string;
  productBrand: Types.ObjectId;
  carBrand: Types.ObjectId;
  category: Types.ObjectId;
  provider: Types.ObjectId;
  stock?: number;
  price?: number;
  priceIVA?: number;
  discount?: number;
  finalPrice?: number;
  enabled?: boolean;
  status?: boolean;
  image?: string;
}
