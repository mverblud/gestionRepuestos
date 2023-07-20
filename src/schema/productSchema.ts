import Joi from "joi";
import { isValidObjectId } from "mongoose";

const baseProviderSchema = Joi.object({
  description: Joi.string(),
  stock: Joi.number().optional().default(0),
  price: Joi.number().optional().default(0),
  priceIVA: Joi.number().optional().default(0),
  discount: Joi.number().optional(),
  finalPrice: Joi.number().optional(),
  enabled: Joi.boolean().optional().default(true),
  status: Joi.boolean().optional().default(true),
  image: Joi.string().optional().default(""),
});

export const createProductSchema = baseProviderSchema.keys({
  code: Joi.string().required(),
  name: Joi.string().required(),
  productBrand: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!isValidObjectId(value)) {
        return helpers.error("The id is invalid");
      }
      return value;
    }),
  carBrand: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!isValidObjectId(value)) {
        return helpers.error("The id is invalid");
      }
      return value;
    }),
  category: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!isValidObjectId(value)) {
        return helpers.error("The id is invalid");
      }
      return value;
    }),
  provider: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!isValidObjectId(value)) {
        return helpers.error("The id is invalid");
      }
      return value;
    }),
});

export const updateProductSchema = baseProviderSchema.keys({
  name: Joi.string().optional(),
  productBrand: Joi.string()
    .optional()
    .custom((value, helpers) => {
      if (!isValidObjectId(value)) {
        return helpers.error("The id is invalid");
      }
      return value;
    }),
  carBrand: Joi.string()
    .optional()
    .custom((value, helpers) => {
      if (!isValidObjectId(value)) {
        return helpers.error("The id is invalid");
      }
      return value;
    }),
  category: Joi.string()
    .optional()
    .custom((value, helpers) => {
      if (!isValidObjectId(value)) {
        return helpers.error("The id is invalid");
      }
      return value;
    }),
  provider: Joi.string()
    .optional()
    .custom((value, helpers) => {
      if (!isValidObjectId(value)) {
        return helpers.error("The id is invalid");
      }
      return value;
    }),
});
