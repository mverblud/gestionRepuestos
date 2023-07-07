import Joi from "joi";

const baseCategorySchema = Joi.object({
  enabled: Joi.boolean().optional(),
  image: Joi.string().optional(),
});

export const createCategorySchema = baseCategorySchema.keys({
  name: Joi.string().required(),
});

export const updateCategorySchema = baseCategorySchema.keys({
  name: Joi.string().optional(),
  status: Joi.boolean().optional(),
});
