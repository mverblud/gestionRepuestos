import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";

import providerModel from "../models/providerModel";
import { IProvider } from "../interfaces/provider.interface";
import {
  createProviderSchema,
  updateProviderSchema,
} from "../schema/proviederSchema";
import { LogLevel, logger } from "../helpers/logger";

const getProviders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 100, offset = 0 } = req.query;

    const [total, providers] = await Promise.all([
      providerModel.countDocuments(),
      providerModel
        .find()
        .skip(Number(offset))
        .limit(Number(limit))
        .sort({ name: 1 }),
    ]);

    res.json({
      total,
      limit: Number(limit),
      offset: Number(offset),
      providers,
    });
  } catch (error) {
    logger("getProviders", error, LogLevel.ERROR);
    res.status(500).json({ error: "Could not get Providers" });
  }
};

const getProvider = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    let providers: IProvider[];
    if (isValidObjectId(id)) {
      // Si el parámetro es un ID válido, busca la categoría por ID
      const provider = await providerModel.findById(id);
      providers = provider ? [provider] : [];
    } else {
      // Si el parámetro no es un ID válido, busca la categoría por letras de búsqueda
      providers = await providerModel.find({
        name: { $regex: id, $options: "i" },
      });
    }
    // Si no se encontraron categorías, devuelve un mensaje indicando que no se encontraron resultados
    if (providers.length === 0) {
      return res.status(404).json({ message: "Could not get Providers." });
    }
    // Si se encontraron categorías, envíalas como respuesta
    return res.json(providers);
  } catch (error) {
    logger("getProvider", error, LogLevel.ERROR);
    return res.status(500).json({ error: "Could not get Providers." });
  }
};

const createProvider = async (req: Request, res: Response) => {
  try {
    const { error, value } = createProviderSchema.validate(req.body, {
      allowUnknown: true,
    });
    const { name, nameShort, address, phoneNumber, emailAddress } = value;

    if (error) {
      return res.status(400).json({ message: "Invalid request body", error });
    }

    //  Verifico si no existe la marca
    const nameUpperCase = name.toUpperCase();
    const existingProvider = await providerModel.findOne({
      name: nameUpperCase,
    });
    if (existingProvider) {
      return res.status(409).json({ message: "Providers already exists." });
    }

    // Crear la nueva categoría
    const newProvider: IProvider = {
      name,
      nameShort,
      address,
      phoneNumber,
      emailAddress,
    };

    await providerModel.create(newProvider);
    return res.status(201).json({ provider: newProvider });
  } catch (error) {
    logger("createProvider", error, LogLevel.ERROR);
    return res.status(500).json({ error: "Failed to create the providers" });
  }
};

const updateProvider = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error, value } = updateProviderSchema.validate(req.body, {
      allowUnknown: true,
    });

    if (error) {
      return res.status(400).json({ message: "Invalid request body", error });
    }

    const updatedProvider: IProvider | null =
      await providerModel.findByIdAndUpdate(id, { $set: value }, { new: true });
    return res.status(200).json(updatedProvider);
  } catch (error) {
    logger("updateProvider", error, LogLevel.ERROR);
    return res.status(500).json({ error: "Error updating the provider" });
  }
};

const deleteProvider = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await providerModel.deleteOne({ _id: id });
    res.json({ result });
  } catch (error) {
    logger("deleteProvider", error, LogLevel.ERROR);
    res.status(500).json({ error: "Error updating the provider" });
  }
};

export {
  getProvider,
  getProviders,
  createProvider,
  updateProvider,
  deleteProvider,
};
