import multer from "multer";
import fs from "fs";
import { Request } from "express";

// Directorio de destino donde se guardarán los archivos
const uploadDirectory = "uploads/";

// Verifica si el directorio de destino existe, de lo contrario lo crea
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}

// Configuración de multer para manejar la carga de archivos
const storage = multer.diskStorage({
  destination: function (_req: Request, _file, cb) {
    cb(null, uploadDirectory); // Directorio de destino donde se guardarán los archivos
  },
  filename: function (_req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Nombre de archivo único
  },
});

const upload = multer({ storage });

export default upload;
