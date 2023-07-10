import Joi from "joi";

const baseProviderSchema = Joi.object({
  address: Joi.string().empty("").optional(),
  phoneNumber: Joi.string().empty("").optional(),
  emailAddress: Joi.string().empty("").optional().email(),
});

export const createProviderSchema = baseProviderSchema.keys({
  name: Joi.string().required(),
  nameShort: Joi.string().required().max(3),
});

export const updateProviderSchema = baseProviderSchema.keys({
  name: Joi.string().optional(),
  nameShort: Joi.string().optional().max(3),
});
