import { Request, Response } from "express";
import { LogLevel, logger } from "../helpers/logger";
import { userSchema } from "../schema/userSchema";
import userModel from "../models/userModel";
import { sendEmail } from "../helpers/sendEmail";
import { IEmailData } from "../interfaces/emailData.interface";
import { IUserDocument } from "../interfaces/user.interface";
import { generateJWT } from "../helpers/generateJWT";

const register = async (req: Request, res: Response) => {
  try {
    const { error, value } = userSchema.validate(req.body);
    const { name, email, password, image, phone } = value;

    if (error) {
      return res.status(400).json({ message: "Invalid request body", error });
    }

    //  Verifico si no existe la marca
    const emailLowerCase = email.toLowerCase();
    const existingUser = await userModel.findOne({
      email: emailLowerCase,
    });
    if (existingUser) {
      return res.status(409).json({ message: "The mail already exists." });
    }

    // Crear la nueva categoría
    const newUser = new userModel({
      name,
      email,
      password,
      image,
      phone,
    });

    await newUser.save();
    //  Envio de email con token para que se confirme el usuario
    const emailData: IEmailData = {
      from: "Administrador Gestion de Repuestos",
      to: email,
      subject: "Confirmar tu cuenta",
      text: "Confirmar tu cuenta",
      html: `<p> Hola: ${name}, comprueba tu cuenta en Gestion de Repuestos.</p>
      <p>Tu cuenta ya esta lista, solo deber comprobarla en el siguiente enlace: 
      <a href="${process.env.FRONTEND_URL}/confirm/${newUser.token}">Comprobar Cuenta</a></p>
      <p>Si tu no creaste esta cuenta, puedes ignorar este mensaje</p>`,
    };
    sendEmail(emailData);
    return res.status(201).json({ newUser });
  } catch (error) {
    logger("login", error, LogLevel.ERROR);
    return res.status(500).json({ error: "failed to register user." });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    // Verificar si el emial existe
    const user: IUserDocument | null = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        msg: "user / Password no son correctos - correo",
      });
    }

    // Si el usuario confirmado
    if (!user.activated) {
      return res.status(400).json({
        msg: "Tu Cuenta no ha sido confirmada",
      });
    }

    const passwordMatch = await user.comprobarPassword(password);
    if (passwordMatch) {
      const usuarioOK = {
        _id: user._id,
        nombre: user.name,
        email: user.email,
        token: generateJWT(user._id),
      };
      return res.json({
        usuarioOK,
      });
    } else {
      return res.status(403).json({
        msg: "Usuario / Password no son correctos",
      });
    }
  } catch (error) {
    logger("login", error, LogLevel.ERROR);
    return res.status(500).json({ error: "failed to login user." });
  }
};

const confirmUser = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const userConfirm = await userModel.findOneAndUpdate(
      { token },
      { $set: { token: "", activated: true } }
    );

    if (!userConfirm) {
      return res.status(400).json({ msg: "Invalid token" });
    }

    return res.json({ message: "User Confirmed Correctly" });
  } catch (error) {
    logger("confirmUser", error, LogLevel.ERROR);
    return res.status(500).json({ error: "Failed to confirm User." });
  }
};

export { login, register, confirmUser };
