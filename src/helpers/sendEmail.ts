//import transport from "../config/nodemailerConfig";
import nodemailer from "nodemailer";
import { IEmailData } from "../interfaces/emailData.interface";
import { LogLevel, logger } from "./logger";

export const sendEmail = async (emailData: IEmailData) => {
  try {
    const emailPort = process.env.NODEMAILER_PORT
      ? parseInt(process.env.NODEMAILER_PORT)
      : undefined;

    const transport = nodemailer.createTransport({
      host: process.env.NODEMAILER_HOST,
      port: emailPort,
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
      },
    });

    const { from, to, subject, text, html } = emailData;

    const info = await transport.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });
    logger("sendEmail", `Mensaje enviado ${info.messageId}`, LogLevel.INFO);
  } catch (error) {
    logger("sendEmail", `Error al enviar el mensaje: ${error}`, LogLevel.ERROR);
  }
};
