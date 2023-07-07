import { Request, Response, NextFunction } from "express";
import { validationResult, Result } from "express-validator";

const validateFields = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors: Result = validationResult(req);
  errors.isEmpty() ? next() : res.status(400).json(errors.array());
};

export default validateFields;
