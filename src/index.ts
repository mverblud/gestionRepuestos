import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";

import authRoute from "./routes/authRoutes";
import carBrandRoute from "./routes/carBrandsRoutes";
import categorieRoute from "./routes/categoryRoutes";
import productBrandRoute from "./routes/productBrandsRoutes";
import productRoute from "./routes/productsRoutes";
import providerRoute from "./routes/providersRoutes";
import searchRoute from "./routes/searchRoutes";
import uploadsRoute from "./routes/uploadsRoutes";
import updateInfoRoute from "./routes/updateInfoRoutes";
import connectDb from "./database/config";
import { LogLevel, logger } from "./helpers/logger";

void (async () => {
  dotenv.config();
  await connectDb();
  const app: Express = express();

  const isProduction = process.env.NODE_ENV === "production";
  // Configuración de Morgan según el entorno
  app.use(morgan(isProduction ? "combined" : "dev"));

  // Middlewares
  app.use(express.json()); // transforma la req.body a un json
  app.use(cors());
  app.use(express.urlencoded({ extended: true }));

  const PATH = process.env.PATH_URL ?? "api";
  app.use(`/${PATH}/auth`, authRoute);
  app.use(`/${PATH}/car-brands`, carBrandRoute);
  app.use(`/${PATH}/categories`, categorieRoute);
  app.use(`/${PATH}/product-brands`, productBrandRoute);
  app.use(`/${PATH}/product`, productRoute);
  app.use(`/${PATH}/providers`, providerRoute);
  app.use(`/${PATH}/search`, searchRoute);
  app.use(`/${PATH}/update-info`, updateInfoRoute);
  app.use(`/${PATH}/uploads`, uploadsRoute);

  const PORT = process.env.PORT ?? 8080;
  const server = app.listen(PORT, () => {
    logger("server", `Server is running on port ${PORT}`, LogLevel.INFO);
  });
  server.on("error", (error) => logger("server", error, LogLevel.ERROR));
})();
