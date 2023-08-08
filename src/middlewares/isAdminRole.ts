import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../interfaces/authenticated.interface";
import { IUser } from "../interfaces/user.interface";

const isAdminRole = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(500).json({
      message: "Trying to verify the role without validating the token first",
    });
  }

  const { role } = req.user as IUser;

  if (role !== "ADMIN_ROLE") {
    return res.status(401).json({
      message: "you are not authorized for this operation",
    });
  }

  return next();
};

export default isAdminRole;
