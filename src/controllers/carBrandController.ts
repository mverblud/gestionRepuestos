import { Request, Response } from "express";
import mongoose from "mongoose";

import carBrandModel from "../models/carBrandModel";
import { ICarBrand } from "../interfaces/carBrand.interface";
import {
  createCarBrandSchema,
  updateCarBrandSchema,
} from "../schema/carBrandSchema";
import cloudinary from "../config/cloudinaryConfig";
import deleteUploadsFolder from "../helpers/deleteUploadsFolder";

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
    console.error("No se pudo obtener las carBrands:", error);
    res.status(400).json({ msg: "No se pudo obtener las carBrands" });
  }
};

const getCarBrand = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    let carBrands: ICarBrand[];
    if (mongoose.isValidObjectId(id)) {
      // Si el parámetro es un ID válido, busca la categoría por ID
      const carBrand = await carBrandModel.findById(id);
      carBrands = carBrand ? [carBrand] : [];
    } else {
      // Si el parámetro no es un ID válido, busca la categoría por letras de búsqueda
      carBrands = await carBrandModel.find({
        name: { $regex: id, $options: "i" },
      });
    }
    // Si no se encontraron categorías, devuelve un mensaje indicando que no se encontraron resultados
    if (carBrands.length === 0) {
      return res.status(404).json({ message: "No se encontraron carBrands." });
    }
    // Si se encontraron categorías, envíalas como respuesta
    return res.json(carBrands);
  } catch (error) {
    console.error("No se pudo obtener la carBrands:", error);
    return res.status(400).json({ message: "No se pudo obtener la carBrands" });
  }
};

const createCarBrand = async (req: Request, res: Response) => {
  try {
    const { error, value } = createCarBrandSchema.validate(req.body, {
      allowUnknown: true,
    });
    const { name, enabled } = value;

    if (error) {
      return res
        .status(400)
        .json({ message: "El cuerpo de la solicitud no es válido", error });
    }

    //  Verifico si no existe la marca
    const nameUpperCase = name.toUpperCase();
    const existingCarBrand = await carBrandModel.findOne({
      name: nameUpperCase,
    });
    if (existingCarBrand) {
      return res.status(409).json({ message: "La carBrand ya existe" });
    }

    let imageUrl: string | undefined;

    // Verifica si se proporcionó un archivo de imagen en la solicitud
    if (req.file) {
      // Sube la imagen a Cloudinary
      const nameToUpperCase: string = name.toUpperCase();
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: folderCarBrands,
        public_id: nameToUpperCase,
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
    console.error("Error al crear la categoría:", error);
    return res.status(400).json({ message: "No se pudo crear la carBrand" });
  }
};

const updateCarBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error, value } = updateCarBrandSchema.validate(req.body, {
      allowUnknown: true,
    });

    if (error) {
      return res
        .status(400)
        .json({ message: "El cuerpo de la solicitud no es válido", error });
    }

    // Obtiene la categoría existente por ID
    const existingCarBrand: ICarBrand | null = await carBrandModel.findById(id);

    if (!existingCarBrand) {
      return res.status(409).json({ message: "La carBrand No existe" });
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
      console.log("uploader", folderCarBrands, req.body.name);
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
    console.error("Error al actualizar la carBrand:", error);
    return res.status(400).json({ msg: "No se pudo actualizar la carBrand" });
  }
};

const deleteCarBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await carBrandModel.findByIdAndUpdate(id, {
      status: false,
    });
    res.json({ category });
  } catch (error) {
    console.error("Error al eliminar la carBrand:", error);
    res.status(400).json({
      msg: "No se pudo borrar la carBrand",
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
