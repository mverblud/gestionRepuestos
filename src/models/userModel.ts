import { model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { IUser, IUserDocument } from "../interfaces/user.interface";
import generateTokenId from "../helpers/generateTokenId";

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "La Contraseña es obligatorio"],
    },
    email: {
      type: String,
      required: [true, "El correo es obligatorio"],
      unique: true,
      lowercase: true,
    },
    image: {
      type: String,
    },
    role: {
      type: String,
      required: true,
      enum: ["ADMIN_ROLE", "USER_ROLE"],
      default: "ADMIN_ROLE",
    },
    phone: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
    },
    token: {
      type: String,
      default: generateTokenId(),
    },
    activated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Muestro la info que necesito
userSchema.methods.toJSON = function () {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { __v, password, ...usuario } = this.toObject();
  //usuario.uid = _id;
  return usuario;
};

// Realizo encriptacion con bcrypt a la password antes de guardar
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comprobarPassword = async function (passwordForm: string) {
  return await bcrypt.compare(passwordForm, this.password);
};

export default model<IUser>("User", userSchema);
