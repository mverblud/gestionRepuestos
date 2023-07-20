import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";

import cloudinary from "../config/cloudinaryConfig";
import deleteUploadsFolder from "../helpers/deleteUploadsFolder";
import { IProductBrand } from "../interfaces/productBrand.interface";
import productBrandModel from "../models/productBrandModel";
import {
  createProductBrandSchema,
  updateProductBrandSchema,
} from "../schema/productBrandSchema";
import { LogLevel, logger } from "../helpers/logger";

const folderProductBrands = "ov/productBrands";

const getProductBrands = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const query = { status: true };

    const [total, productBrands] = await Promise.all([
      productBrandModel.countDocuments(query),
      productBrandModel
        .find(query)
        .skip(Number(offset))
        .limit(Number(limit))
        .sort({ name: 1 }),
    ]);

    res.json({
      total,
      limit: Number(limit),
      offset: Number(offset),
      productBrands,
    });
  } catch (error) {
    logger("getProductBrands", error, LogLevel.ERROR);
    res.status(500).json({ error: "Could not get ProductBrands." });
  }
};

const getProductBrand = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    let productBrands: IProductBrand[];
    if (isValidObjectId(id)) {
      // Si el parámetro es un ID válido, busca la categoría por ID
      const productBrand = await productBrandModel.findById(id);
      productBrands = productBrand ? [productBrand] : [];
    } else {
      // Si el parámetro no es un ID válido, busca la categoría por letras de búsqueda
      productBrands = await productBrandModel.find({
        name: { $regex: id, $options: "i" },
      });
    }
    // Si no se encontraron categorías, devuelve un mensaje indicando que no se encontraron resultados
    if (productBrands.length === 0) {
      return res.status(404).json({ message: "Could not get productBrands." });
    }
    // Si se encontraron categorías, envíalas como respuesta
    return res.json(productBrands);
  } catch (error) {
    logger("getProductBrand", error, LogLevel.ERROR);
    return res.status(500).json({ error: "Could not get ProductBrands." });
  }
};

const createProductBrand = async (req: Request, res: Response) => {
  try {
    const { error, value } = createProductBrandSchema.validate(req.body, {
      allowUnknown: true,
    });
    const { name, enabled } = value;

    if (error) {
      return res.status(400).json({ message: "Invalid request body", error });
    }

    //  Verifico si no existe la marca
    const nameUpperCase = name.toUpperCase();
    const existingProductBrand = await productBrandModel.findOne({
      name: nameUpperCase,
    });
    if (existingProductBrand) {
      return res.status(409).json({ message: "ProductBrand already exists." });
    }

    let imageUrl: string | undefined;

    // Verifica si se proporcionó un archivo de imagen en la solicitud
    if (req.file) {
      // Sube la imagen a Cloudinary
      const nameToUpperCase: string = name.toUpperCase();
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: folderProductBrands,
        public_id: nameToUpperCase,
      });
      imageUrl = result.secure_url;

      // Elimina el contenido de la Productpeta 'uploads' después de subir la imagen a Cloudinary
      deleteUploadsFolder();
    }

    // Crear la nueva categoría
    const newProductBrand: IProductBrand = {
      name,
      enabled: enabled || true,
      image: imageUrl,
    };

    await productBrandModel.create(newProductBrand);
    return res.status(201).json({ ProductBrand: newProductBrand });
  } catch (error) {
    logger("createProductBrand", error, LogLevel.ERROR);
    return res
      .status(500)
      .json({ error: "Failed to create the productBrand." });
  }
};

const updateProductBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error, value } = updateProductBrandSchema.validate(req.body, {
      allowUnknown: true,
    });

    if (error) {
      return res.status(400).json({ message: "Invalid request body", error });
    }

    // Obtiene la categoría existente por ID
    const existingProductBrand: IProductBrand | null =
      await productBrandModel.findById(id);

    if (!existingProductBrand) {
      return res.status(409).json({ message: "ProductBrand not found" });
    }

    // Verifica si se proporcionó un nuevo nombre de categoría
    if (req.body.name) {
      if (existingProductBrand && existingProductBrand.image) {
        // Elimina la imagen antigua de Cloudinary
        cloudinary.uploader.destroy(
          `${folderProductBrands}/${existingProductBrand.name}`
        );
      }
    }

    // Verifica si se proporcionó una nueva imagen de categoría
    if (req.file) {
      // Sube la nueva imagen a Cloudinary utilizando el nombre de la categoría como public_id
      const { secure_url } = await cloudinary.uploader.upload(req.file.path, {
        folder: folderProductBrands,
        public_id: req.body.name,
      });
      value.image = secure_url;

      // Elimina el contenido de la Productpeta 'uploads' después de subir la nueva imagen a Cloudinary
      deleteUploadsFolder();
    }

    const updatedProductBrand: IProductBrand | null =
      await productBrandModel.findByIdAndUpdate(
        id,
        { $set: value },
        { new: true }
      );
    return res.status(200).json(updatedProductBrand);
  } catch (error) {
    logger("updateProductBrand", error, LogLevel.ERROR);
    return res.status(500).json({ error: "Error updating the ProductBrand." });
  }
};

const deleteProductBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await productBrandModel.findByIdAndUpdate(id, {
      status: false,
    });
    res.json({ category });
  } catch (error) {
    logger("deleteProductBrand", error, LogLevel.ERROR);
    res.status(500).json({
      error: "Error deleting the productBrand.",
    });
  }
};

export {
  getProductBrand,
  getProductBrands,
  createProductBrand,
  updateProductBrand,
  deleteProductBrand,
};
