import Joi from "joi";

const baseProductBrandSchema = Joi.object({
  enabled: Joi.boolean().optional(),
  image: Joi.string().optional(),
});

export const createProductBrandSchema = baseProductBrandSchema.keys({
  name: Joi.string().required(),
});

export const updateProductBrandSchema = baseProductBrandSchema.keys({
  name: Joi.string().optional(),
  status: Joi.boolean().optional(),
});
