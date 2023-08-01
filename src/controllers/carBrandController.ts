import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";

import carBrandModel from "../models/carBrandModel";
import { ICarBrand } from "../interfaces/carBrand.interface";
import {
  createCarBrandSchema,
  updateCarBrandSchema,
} from "../schema/carBrandSchema";
import cloudinary from "../config/cloudinaryConfig";
import deleteUploadsFolder from "../helpers/deleteUploadsFolder";
import { LogLevel, logger } from "../helpers/logger";

const folderCarBrands = "ov/carBrands";

const getCarBrands = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const query = { status: true };

    const [total, carBrands] = await Promise.all([
      carBrandModel.countDocuments(query),
      carBrandModel
        .find(query)
        .skip(Number(offset))
        .limit(Number(limit))
        .sort({ name: 1 }),
    ]);

    res.json({
      total,
      limit: Number(limit),
      offset: Number(offset),
      carBrands,
    });
  } catch (error) {
    logger("getCarBrands", error, LogLevel.ERROR);
    res.status(500).json({ error: "Could not get Carbrands." });
  }
};

const getCarBrand = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    let carBrands: ICarBrand[];
    if (isValidObjectId(id)) {
      // Si el parámetro es un ID válido, busca la categoría por ID
      const carBrand = await carBrandModel.findById(id);
      carBrands = carBrand ? [carBrand] : [];
    } else {
      // Si el parámetro no es un ID válido, busca la categoría por letras de búsqueda
      carBrands = await carBrandModel
        .find({
          name: { $regex: id, $options: "i" },
        })
        .sort({ name: 1 });
    }
    // Si no se encontraron categorías, devuelve un mensaje indicando que no se encontraron resultados
    if (carBrands.length === 0) {
      return res.status(404).json({ message: "Could not get carBrands." });
    }
    // Si se encontraron categorías, envíalas como respuesta
    return res.json(carBrands);
  } catch (error) {
    logger("getCarBrand", error, LogLevel.ERROR);
    return res.status(500).json({ error: "Could not get carBrands." });
  }
};

const createCarBrand = async (req: Request, res: Response) => {
  try {
    const { error, value } = createCarBrandSchema.validate(req.body, {
      allowUnknown: true,
    });
    const { name, enabled } = value;

    if (error) {
      return res.status(400).json({ message: "Invalid request body", error });
    }

    //  Verifico si no existe la marca
    const nameUpperCase = name.toUpperCase();
    if (
      await carBrandModel.exists({
        name: nameUpperCase,
      })
    ) {
      return res.status(409).json({ message: "Carbrand already exists." });
    }

    let imageUrl: string | undefined;

    // Verifica si se proporcionó un archivo de imagen en la solicitud
    if (req.file) {
      // Sube la imagen a Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: folderCarBrands,
        public_id: nameUpperCase,
      });
      imageUrl = result.secure_url;

      // Elimina el contenido de la carpeta 'uploads' después de subir la imagen a Cloudinary
      deleteUploadsFolder();
    }

    // Crear la nueva categoría
    const newCarBrand: ICarBrand = {
      name,
      enabled: enabled || true,
      image: imageUrl,
    };

    await carBrandModel.create(newCarBrand);
    return res.status(201).json({ carBrand: newCarBrand });
  } catch (error) {
    logger("createCarBrand", error, LogLevel.ERROR);
    return res.status(500).json({ error: "Failed to create the carBrand." });
  }
};

const updateCarBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error, value } = updateCarBrandSchema.validate(req.body, {
      allowUnknown: true,
    });

    if (error) {
      return res.status(400).json({ message: "Invalid request body", error });
    }

    // Verificar si id es un ObjectId válido
    if (!isValidObjectId(id)) {
      return res.status(409).json({ message: "The id is invalid" });
    }

    // Obtiene la categoría existente por ID
    const existingCarBrand: ICarBrand | null = await carBrandModel.findById(id);
    if (!existingCarBrand) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Verifica si se proporcionó un nuevo nombre de categoría
    if (req.body.name) {
      if (existingCarBrand && existingCarBrand.image) {
        // Elimina la imagen antigua de Cloudinary
        cloudinary.uploader.destroy(
          `${folderCarBrands}/${existingCarBrand.name}`
        );
      }
    }

    // Verifica si se proporcionó una nueva imagen de categoría
    if (req.file) {
      // Sube la nueva imagen a Cloudinary utilizando el nombre de la categoría como public_id
      const { secure_url } = await cloudinary.uploader.upload(req.file.path, {
        folder: folderCarBrands,
        public_id: req.body.name,
      });
      value.image = secure_url;

      // Elimina el contenido de la carpeta 'uploads' después de subir la nueva imagen a Cloudinary
      deleteUploadsFolder();
    }

    const updatedCarBrand: ICarBrand | null =
      await carBrandModel.findByIdAndUpdate(id, { $set: value }, { new: true });
    return res.status(200).json(updatedCarBrand);
  } catch (error) {
    logger("updateCarBrand", error, LogLevel.ERROR);
    return res.status(500).json({ error: "Error updating the carBrand." });
  }
};

const deleteCarBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await carBrandModel.updateOne(
      { _id: id },
      { status: false }
    );
    res.json({ category });
  } catch (error) {
    logger("deleteCarBrand", error, LogLevel.ERROR);
    res.status(500).json({
      error: "Error deleting the carBrand.",
    });
  }
};

export {
  getCarBrand,
  getCarBrands,
  createCarBrand,
  updateCarBrand,
  deleteCarBrand,
};
