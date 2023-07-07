import Joi from "joi";

const baseCarBrandSchema = Joi.object({
  enabled: Joi.boolean().optional(),
  image: Joi.string().optional(),
});

export const createCarBrandSchema = baseCarBrandSchema.keys({
  name: Joi.string().required(),
});

export const updateCarBrandSchema = baseCarBrandSchema.keys({
  name: Joi.string().optional(),
  status: Joi.boolean().optional(),
});
