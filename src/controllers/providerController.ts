import { Request, Response } from "express";
import mongoose from "mongoose";

import providerModel from "../models/providerModel";
import { IProvider } from "../interfaces/provider.interface";
import {
  createProviderSchema,
  updateProviderSchema,
} from "../schema/proviederSchema";

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
    console.error("No se pudo obtener las Providers:", error);
    res.status(400).json({ msg: "No se pudo obtener las Providers" });
  }
};

const getProvider = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    let providers: IProvider[];
    if (mongoose.isValidObjectId(id)) {
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
      return res.status(404).json({ message: "No se encontraron Providers." });
    }
    // Si se encontraron categorías, envíalas como respuesta
    return res.json(providers);
  } catch (error) {
    console.error("No se pudo obtener la Providers:", error);
    return res.status(400).json({ message: "No se pudo obtener la Providers" });
  }
};

const createProvider = async (req: Request, res: Response) => {
  try {
    const { error, value } = createProviderSchema.validate(req.body, {
      allowUnknown: true,
    });
    const { name, nameShort, address, phoneNumber, emailAddress } = value;

    if (error) {
      return res
        .status(400)
        .json({ message: "El cuerpo de la solicitud no es válido", error });
    }

    //  Verifico si no existe la marca
    const nameUpperCase = name.toUpperCase();
    const existingProvider = await providerModel.findOne({
      name: nameUpperCase,
    });
    if (existingProvider) {
      return res.status(409).json({ message: "La Provider ya existe" });
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
    console.error("Error al crear la Provider:", error);
    return res.status(400).json({ message: "No se pudo crear la Provider" });
  }
};

const updateProvider = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error, value } = updateProviderSchema.validate(req.body, {
      allowUnknown: true,
    });

    if (error) {
      return res
        .status(400)
        .json({ message: "El cuerpo de la solicitud no es válido", error });
    }

    const updatedProvider: IProvider | null =
      await providerModel.findByIdAndUpdate(id, { $set: value }, { new: true });
    return res.status(200).json(updatedProvider);
  } catch (error) {
    console.error("Error al actualizar la Provider:", error);
    return res.status(400).json({ msg: "No se pudo actualizar la Provider" });
  }
};

const deleteProvider = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await providerModel.deleteOne({ _id: id });
    res.json({ result });
  } catch (error) {
    console.error("Error al eliminar la Provider:", error);
    res.status(400).json({
      msg: "No se pudo borrar la Provider",
    });
  }
};

export {
  getProvider,
  getProviders,
  createProvider,
  updateProvider,
  deleteProvider,
};
