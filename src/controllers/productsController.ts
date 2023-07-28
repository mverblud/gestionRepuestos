import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import productModel from "../models/productModel";
import { IProduct } from "../interfaces/product.interface";
import {
  createProductSchema,
  updateProductSchema,
} from "../schema/productSchema";
import cloudinary from "../config/cloudinaryConfig";
import deleteUploadsFolder from "../helpers/deleteUploadsFolder";
import productBrandModel from "../models/productBrandModel";
import carBrandModel from "../models/carBrandModel";
import categoryModel from "../models/categoryModel";
import providerModel from "../models/providerModel";
import { LogLevel, logger } from "../helpers/logger";

const folderProducts = "ov/products";

const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const query = { status: true };

    const [total, products] = await Promise.all([
      productModel.countDocuments(query),
      productModel
        .find(query)
        .populate("productBrand", "name")
        .populate("category", "name")
        .populate("carBrand", "name")
        .populate("provider", "name nameShort")
        .skip(Number(offset))
        .limit(Number(limit))
        .sort({ name: 1 }),
    ]);

    res.json({
      total,
      limit: Number(limit),
      offset: Number(offset),
      products,
    });
  } catch (error) {
    logger("getProducts", error, LogLevel.ERROR);
    res.status(500).json({ error: "Could not get Products" });
  }
};

const getProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    let products: IProduct[];
    if (isValidObjectId(id)) {
      // Si el parámetro es un ID válido, busca la categoría por ID
      const product = await productModel
        .findById(id)
        .populate("category", "name")
        .populate("carBrand", "name")
        .populate("productBrand", "name")
        .populate("provider", "name");
      products = product ? [product] : [];
    } else {
      // Si el parámetro no es un ID válido, busca la categoría por letras de búsqueda
      products = await productModel
        .find({
          name: { $regex: id, $options: "i" },
        })
        .populate("category", "name")
        .populate("carBrand", "name")
        .populate("productBrand", "name")
        .populate("provider", "name")
        .sort({ name: 1 });
    }
    // Si no se encontraron categorías, devuelve un mensaje indicando que no se encontraron resultados
    if (products.length === 0) {
      return res.status(404).json({ message: "Could not get Products." });
    }
    // Si se encontraron categorías, envíalas como respuesta
    return res.json(products);
  } catch (error) {
    logger("getProduct", error, LogLevel.ERROR);
    return res.status(500).json({ error: "Could not get Products." });
  }
};

const createProduct = async (req: Request, res: Response) => {
  try {
    const { error, value } = createProductSchema.validate(req.body, {
      allowUnknown: true,
    });
    const {
      code,
      name,
      description,
      productBrand,
      carBrand,
      category,
      provider,
      stock,
      price,
      priceIVA,
      discount,
      finalPrice,
      enabled,
      status,
    }: IProduct = value;

    if (error) {
      return res.status(400).json({ message: "Invalid request body", error });
    }

    // Verificar si ya existe un producto con los mismos valores
    const existingProduct = await productModel.findOne({
      code: code.toUpperCase(),
      productBrand,
      carBrand,
      category,
      provider,
    });
    if (existingProduct) {
      return res.status(409).json({
        message: `Product already exists: code, productBrand, carBrand, category, provider`,
      });
    }

    // Verificar la existencia de las referencias
    const [productBrandExists, carBrandExists, categoryExists, providerExists] =
      await Promise.all([
        productBrandModel.exists({ _id: productBrand }),
        carBrandModel.exists({ _id: carBrand }),
        categoryModel.exists({ _id: category }),
        providerModel.exists({ _id: provider }),
      ]);

    if (!productBrandExists) {
      return res
        .status(409)
        .json({ message: "Invalid reference to productBrand" });
    }

    if (!carBrandExists) {
      return res.status(409).json({ message: "Invalid reference to carBrand" });
    }

    if (!categoryExists) {
      return res.status(409).json({ message: "Invalid reference to category" });
    }

    if (!providerExists) {
      return res.status(409).json({ message: "Invalid reference to provider" });
    }

    let imageUrl: string | undefined;

    // Verifica si se proporcionó un archivo de imagen en la solicitud
    if (req.file) {
      // Sube la imagen a Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: folderProducts,
        public_id: code.toUpperCase(),
      });
      imageUrl = result.secure_url;
      // Elimina el contenido de la carpeta "uploads" después de subir la imagen a Cloudinary
      deleteUploadsFolder();
    }

    // Crear la nueva categoría
    const newProduct: IProduct = {
      code,
      name,
      description,
      productBrand,
      carBrand,
      category,
      provider,
      stock,
      price,
      priceIVA,
      discount,
      finalPrice,
      enabled,
      status,
      image: imageUrl,
    };

    const product = await productModel.create(newProduct);
    return res.status(201).json({ product });
  } catch (error) {
    logger("createProduct", error, LogLevel.ERROR);
    return res.status(500).json({ error: "Failed to create the product" });
  }
};

const updateProduct = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const {
      name,
      productBrand,
      carBrand,
      category,
      provider,
      ...otherFields
    }: IProduct = req.body;

    // Validar los datos de entrada utilizando el esquema de Joi
    const { error } = updateProductSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: "Invalid request body", error });
    }

    // Verificar si id es un ObjectId válido
    if (!isValidObjectId(id)) {
      return res.status(409).json({ message: "The id is invalid" });
    }

    // Verificar la existencia del producto
    const existingProduct: IProduct | null = await productModel.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Validar y actualizar la referencia productBrand
    if (productBrand) {
      const existingProductBrand = await productBrandModel.exists(productBrand);
      if (!existingProductBrand) {
        return res
          .status(404)
          .json({ message: "Invalid reference to productBrand" });
      }
      existingProduct.productBrand = productBrand;
    }

    // Validar y actualizar la referencia carBrand
    if (carBrand) {
      const existingCarBrand = await carBrandModel.exists(carBrand);
      if (!existingCarBrand) {
        return res
          .status(404)
          .json({ message: "Invalid reference to carBrand" });
      }
      existingProduct.carBrand = carBrand;
    }

    // Validar y actualizar la referencia category
    if (category) {
      const existingCategory = await categoryModel.exists(category);
      if (!existingCategory) {
        return res
          .status(404)
          .json({ message: "Invalid reference to category" });
      }
      existingProduct.category = category;
    }

    // Validar y actualizar la referencia provider
    if (provider && !(await providerModel.exists(provider))) {
      return res.status(404).json({ message: "Invalid reference to provider" });
    }
    existingProduct.provider = provider;

    // Verifica si se proporcionó una nueva imagen de producto
    if (req.file) {
      // Sube la nueva imagen a Cloudinary utilizando el nombre de la categoría como public_id
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: folderProducts,
        public_id: existingProduct.code,
      });

      existingProduct.image = result.secure_url;

      // Elimina el contenido de la carpeta 'uploads' después de subir la nueva imagen a Cloudinary
      deleteUploadsFolder();
    }

    // Actualizar el producto
    existingProduct.name = name || existingProduct.name;
    Object.assign(existingProduct, otherFields);

    const updatedProduct = await productModel.findByIdAndUpdate(
      id,
      existingProduct,
      {
        new: true,
      }
    );
    return res.status(200).json(updatedProduct);
  } catch (error) {
    logger("updateProduct", error, LogLevel.ERROR);
    return res.status(500).json({ error: "Error updating the product" });
  }
};

const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await productModel.findByIdAndUpdate(id, {
      status: false,
    });
    res.json({ product });
  } catch (error) {
    logger("deleteProduct", error, LogLevel.ERROR);
    res.status(500).json({ error: "Error deleting the product" });
  }
};

export { getProduct, getProducts, createProduct, updateProduct, deleteProduct };
