import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";

import CategoryModel from "../models/categoryModel";
import { ICategory } from "../interfaces/category.interface";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../schema/categorySchema";
import cloudinary from "../config/cloudinaryConfig";
import deleteUploadsFolder from "../helpers/deleteUploadsFolder";
import { LogLevel, logger } from "../helpers/logger";

const folderCategories = "ov/categories";

const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const query = { status: true };

    const [total, categories] = await Promise.all([
      CategoryModel.countDocuments(query),
      CategoryModel.find(query)
        .skip(Number(offset))
        .limit(Number(limit))
        .sort({ name: 1 }),
    ]);

    res.json({
      total,
      limit: Number(limit),
      offset: Number(offset),
      categories,
    });
  } catch (error) {
    logger("getCategories", error, LogLevel.ERROR);
    res.status(500).json({ error: "Could not get Categories." });
  }
};

const getCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    let categories: ICategory[];
    if (isValidObjectId(id)) {
      // Si el parámetro es un ID válido, busca la categoría por ID
      const category = await CategoryModel.findById(id);
      categories = category ? [category] : [];
    } else {
      // Si el parámetro no es un ID válido, busca la categoría por letras de búsqueda
      categories = await CategoryModel.find({
        name: { $regex: id, $options: "i" },
      }).sort({ name: 1 });
    }
    // Si no se encontraron categorías, devuelve un mensaje indicando que no se encontraron resultados
    if (categories.length === 0) {
      return res.status(404).json({ message: "Could not get categories." });
    }
    // Si se encontraron categorías, envíalas como respuesta
    return res.json(categories);
  } catch (error) {
    logger("getCategory", error, LogLevel.ERROR);
    return res.status(500).json({ error: "Could not get categories." });
  }
};

const createCategory = async (req: Request, res: Response) => {
  try {
    const { error, value } = createCategorySchema.validate(req.body, {
      allowUnknown: true,
    });
    const { name, enabled } = value;

    if (error) {
      return res.status(400).json({ message: "Invalid request body", error });
    }

    //  Verifico si no existe la marca
    const nameUpperCase = name.toUpperCase();
    const existingCategory = await CategoryModel.findOne({
      name: nameUpperCase,
    });
    if (existingCategory) {
      return res.status(409).json({ message: "Category already exists." });
    }

    let imageUrl: string | undefined;

    // Verifica si se proporcionó un archivo de imagen en la solicitud
    if (req.file) {
      // Sube la imagen a Cloudinary
      const nameToUpperCase: string = name.toUpperCase();
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: folderCategories,
        public_id: nameToUpperCase,
      });
      imageUrl = result.secure_url;

      // Elimina el contenido de la carpeta 'uploads' después de subir la imagen a Cloudinary
      deleteUploadsFolder();
    }

    // Crear la nueva categoría
    const newCategory: ICategory = {
      name,
      enabled: enabled || true,
      image: imageUrl,
    };

    await CategoryModel.create(newCategory);
    return res.status(201).json({ category: newCategory });
  } catch (error) {
    logger("createCategory", error, LogLevel.ERROR);
    return res.status(500).json({ error: "Failed to create the category." });
  }
};

const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error, value } = updateCategorySchema.validate(req.body, {
      allowUnknown: true,
    });

    if (error) {
      return res.status(400).json({ message: "Invalid request body", error });
    }

    // Obtiene la categoría existente por ID
    const existingCategory: ICategory | null = await CategoryModel.findById(id);

    if (!existingCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Verifica si se proporcionó un nuevo nombre de categoría
    if (req.body.name) {
      if (existingCategory && existingCategory.image) {
        // Elimina la imagen antigua de Cloudinary
        await cloudinary.uploader.destroy(
          `${folderCategories}/${existingCategory.name}`
        );
      }
    }

    // Verifica si se proporcionó una nueva imagen de categoría
    if (req.file) {
      // Sube la nueva imagen a Cloudinary utilizando el nombre de la categoría como public_id
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: folderCategories,
        public_id: req.body.name,
      });

      value.image = result.secure_url;

      // Elimina el contenido de la carpeta 'uploads' después de subir la nueva imagen a Cloudinary
      deleteUploadsFolder();
    }

    const updatedCategory: ICategory | null =
      await CategoryModel.findByIdAndUpdate(id, { $set: value }, { new: true });
    return res.status(200).json(updatedCategory);
  } catch (error) {
    logger("updateCategory", error, LogLevel.ERROR);
    return res.status(500).json({ error: "Error updating the product." });
  }
};

const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await CategoryModel.findByIdAndUpdate(id, {
      status: false,
    });
    res.json({ category });
  } catch (error) {
    logger("deleteCategory", error, LogLevel.ERROR);
    res.status(500).json({
      error: "Error deleting the product.",
    });
  }
};

export {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
