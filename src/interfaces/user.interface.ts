import { Document } from "mongoose";

export interface IUserDocument extends Document, IUser {
  comprobarPassword(passwordForm: string): Promise<boolean>;
}

export interface IUser {
  name: string;
  email: string;
  password: string;
  phone?: number;
  image?: string;
  token?: string;
  activated?: boolean;
  role?: string;
}
