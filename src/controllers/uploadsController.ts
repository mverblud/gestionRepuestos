import { Request, Response } from "express";
import { readCSVFile, readCSVFileUpdate } from "../helpers/readCsvFile";
import productBrandModel from "../models/productBrandModel";
import categoryModel from "../models/categoryModel";
import carBrandModel from "../models/carBrandModel";
import providerModel from "../models/providerModel";
import productModel from "../models/productModel";
import { LogLevel, logger } from "../helpers/logger";
import { isValidObjectId } from "mongoose";
import updateInfoModel from "../models/updateInfoModel";
import updateInfoDetailModel from "../models/updateInfoDetailModel";
import { isNumeric } from "../helpers/isNumeric";
import { roundToDecimal } from "../helpers/roundToDecimal";
import { AuthenticatedRequestUser } from "../interfaces/authenticated.interface";

const uploadCSV = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "The file is required." });
      return;
    }

    const { originalname } = req.file;
    const extension = originalname.split(".").pop();

    if (extension !== "csv") {
      res.status(400).json({ error: "The file must have a .csv extension." });
      return;
    }

    const filePath = req.file.path;
    const results = await readCSVFile(filePath);

    // Obtener los valores únicos de productBrand y category del array de productos
    const uniqueProductBrands = [
      ...new Set(
        results.map((product) => product.productBrand.toUpperCase().trim())
      ),
    ];
    const uniqueCategories = [
      ...new Set(
        results.map((product) => product.category.toUpperCase().trim())
      ),
    ];
    const uniqueCarBrands = [
      ...new Set(
        results.map((product) => product.carBrand.toUpperCase().trim())
      ),
    ];
    const uniqueProviders = [
      ...new Set(
        results.map((product) => product.provider.toUpperCase().trim())
      ),
    ];

    // Buscar las marcas y categorías correspondientes en la base de datos
    const [productBrands, categories, carBrands, providers] = await Promise.all(
      [
        productBrandModel.find(
          { name: { $in: uniqueProductBrands } },
          "_id name"
        ),
        categoryModel.find({ name: { $in: uniqueCategories } }, "_id name"),
        carBrandModel.find({ name: { $in: uniqueCarBrands } }, "_id name"),
        providerModel.find(
          { nameShort: { $in: uniqueProviders } },
          "_id nameShort"
        ),
      ]
    );

    // Crear un mapa de marcas y categorías con sus respectivos IDs
    const productBrandMap = new Map(
      productBrands.map((productBrand) => [productBrand.name, productBrand._id])
    );
    const categoryMap = new Map(
      categories.map((category) => [category.name, category._id])
    );
    const carBrandMap = new Map(
      carBrands.map((carBrand) => [carBrand.name, carBrand._id])
    );
    const providerMap = new Map(
      providers.map((provider) => [provider.nameShort, provider._id])
    );

    // Asignar los IDs correspondientes a las marcas y categorías en los productos
    for (const product of results) {
      const productBrandID = productBrandMap.get(
        product.productBrand
      ) as unknown as string;
      const categoryID = categoryMap.get(
        product.category.toUpperCase().trim()
      ) as unknown as string;
      const carBrandID = carBrandMap.get(
        product.carBrand.toUpperCase().trim()
      ) as unknown as string;
      const providerID = providerMap.get(
        product.provider.toUpperCase().trim()
      ) as unknown as string;

      product.productBrandName = product.productBrand;
      product.categoryName = product.category;
      product.carBrandName = product.carBrand;
      product.providerName = product.provider;

      product.productBrand = productBrandID;
      product.category = categoryID;
      product.carBrand = carBrandID;
      product.provider = providerID;
      product.image =
        "https://res.cloudinary.com/dxwi6ybxk/image/upload/v1690482572/ov/products/imagennodisponible.png";
    }

    const resultadoMany = await productModel.insertMany(results);

    res.json({
      results: results.length,
      resultadoMany: resultadoMany.length,
    });
  } catch (error) {
    logger("uploadCSV", error, LogLevel.ERROR);
    res.status(500).json({ error: "Could not update Product" });
  }
};

const updatePrice = async (req: AuthenticatedRequestUser, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const headersString = req.body.headers; // Recibir los headers como una cadena de texto
    const headers = headersString.split(","); // Convertir la cadena en un array

    // Verificar que el cuerpo de la solicitud contiene los headers requeridos
    if (!headers || !headers.includes("code") || !headers.includes("price")) {
      return res.status(400).json({
        error: "The 'code' and 'price' headers are required.",
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file has been uploaded." });
    }

    const { originalname } = req.file;
    const extension = originalname.split(".").pop();

    if (extension !== "csv") {
      return res
        .status(400)
        .json({ error: "The file must have a .csv extension." });
    }

    if (!isValidObjectId(id)) {
      return res.status(409).json({ message: "The id is invalid" });
    }

    const provider = await providerModel.findById(id);
    if (!provider) {
      return res.status(409).json({ message: "Providers does not exist." });
    }

    // Elimino codigo duplicado
    const filePath = req.file.path;
    let results = await readCSVFileUpdate(filePath, headers);
    results = [...new Map(results.map((obj) => [obj.code, obj])).values()];

    const productsInfo = [];
    for (const item of results) {
      const { code, price } = item;

      let formattedPreviousPrice = 0;
      let formattedPreviousPriceIVA = 0;

      // Convertir price de string a number
      const numericPrice = Number(price);
      // Verificar si el precio es válido (es un número)
      if (!isNumeric(numericPrice)) {
        continue;
      }

      const newPrice = roundToDecimal(numericPrice, 2);
      const newPriceIVA = roundToDecimal(newPrice * 1.21, 2);

      const productsCursor = await productModel.find(
        { code, provider: id },
        "price priceIVA"
      );
      if (productsCursor.length === 0) {
        continue; // Descartar el producto si no existe en la base de datos
      }

      for (const product of productsCursor) {
        if (product.price === newPrice && product.priceIVA === newPriceIVA) {
          continue; // Descartar el producto si los precios no han cambiado
        }

        formattedPreviousPrice = roundToDecimal(product?.price ?? 0, 2);
        formattedPreviousPriceIVA = roundToDecimal(product?.priceIVA ?? 0, 2);

        const pricePercentageIncrease =
          formattedPreviousPrice !== 0
            ? roundToDecimal(
              ((newPrice - formattedPreviousPrice) / formattedPreviousPrice) *
              100,
              2
            )
            : -100;

        const productInfo = {
          _id: product._id,
          code: product.code,
          previousPrice: formattedPreviousPrice,
          previousPriceIVA: formattedPreviousPriceIVA,
          newPrice,
          newPriceIva: newPriceIVA,
          priceDifference: newPrice - formattedPreviousPrice,
          pricePercentageIncrease,
        };
        productsInfo.push(productInfo);

        await productModel.updateOne(
          { _id: product._id },
          { price: newPrice, priceIVA: newPriceIVA }
        );
      }
    }

    if (productsInfo.length !== 0) {
      // Grabo cabecera de archivo
      const updateInfo = await updateInfoModel.create({
        fileName: originalname,
        productCount: productsInfo.length,
        provider: id,
        user: userId,
      });

      // Crear un array con los documentos a insertar en updateInfoDetailModel
      const updateInfoDetailDocs = productsInfo.map((item) => {
        const {
          _id,
          previousPrice,
          newPrice,
          priceDifference,
          pricePercentageIncrease,
        } = item;

        return {
          updateInfo: updateInfo._id,
          product: _id,
          previousPrice,
          newPrice,
          priceDifference,
          pricePercentageIncrease,
        };
      });

      // Insertar los documentos en updateInfoDetailModel utilizando insertMany
      await updateInfoDetailModel.insertMany(updateInfoDetailDocs);

      return res.json({
        fileName: originalname,
        headers,
        count: results.length,
        productsInfo: productsInfo.length,
        updateInfo,
      });
    }

    return res.json({
      fileName: originalname,
      headers,
      count: results.length,
      productsInfo: productsInfo.length,
    });
  } catch (error) {
    logger("updatePrice", error, LogLevel.ERROR);
    return res.status(500).json({ error: "Could not update Price" });
  }
};

export { uploadCSV, updatePrice };
