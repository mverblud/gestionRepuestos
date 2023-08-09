import { Request } from "express";
import { IUser } from "./user.interface";

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}
export interface AuthenticatedRequestUser extends Request {
  user?: IUserId;
}

interface IUserId {
  _id?: string;
}
