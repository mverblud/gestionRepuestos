import Joi from "joi";

export const userSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
  phone: Joi.number().integer().min(1000000000).max(9999999999),
  image: Joi.string(),
  token: Joi.string(),
  activated: Joi.boolean(),
  role: Joi.string(),
});
