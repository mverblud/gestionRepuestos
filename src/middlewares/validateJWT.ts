import { Response, NextFunction } from "express";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import userModel from "../models/userModel";
import { AuthenticatedRequest } from "../interfaces/authenticated.interface";
import { LogLevel, logger } from "../helpers/logger";

interface DecodedToken extends JwtPayload {
  id: string;
}

const validateJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const secretKey: Secret = process.env.SECRETORPRIVATEKEY || "D3fau1t";
      const decoded = jwt.verify(token, secretKey) as DecodedToken;

      const user = await userModel
        .findById(decoded.id)
        .select("-password -token -confirmado");

      if (!user) {
        const err = new Error("User not found");
        return res.status(404).json({ message: err.message });
      }
      req.user = user;
      return next();
    } catch (error) {
      logger("validateJWT", error, LogLevel.ERROR);
      return res.status(403).json({ message: "Invalid token" });
    }
  }

  if (!token) {
    const error = new Error("Invalid or missing token");
    return res.status(403).json({ message: error.message });
  }
  next();
};

export default validateJWT;
