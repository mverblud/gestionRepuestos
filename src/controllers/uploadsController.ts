import { Request, Response } from "express";
import { readCSVFile } from "../helpers/readCsvFile";
import productBrandModel from "../models/productBrandModel";
import categoryModel from "../models/categoryModel";
import carBrandModel from "../models/carBrandModel";
import providerModel from "../models/providerModel";
import productModel from "../models/productModel";

const uploadCSV = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No se ha enviado ningún archivo." });
      return;
    }

    const { originalname } = req.file;
    const extension = originalname.split(".").pop();

    if (extension !== "csv") {
      res.status(400).json({ error: "El archivo debe tener extensión .csv." });
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
      console.log({ product });
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
    }

    const resultadoMany = await productModel.insertMany(results);

    res.json({
      results: results.length,
      resultadoMany: resultadoMany.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Ocurrió un error interno." });
  }
};

export { uploadCSV };
