import dotenv from "dotenv";
import fs from "fs";
import connectDb from "../database/config";
import categoryModel from "../models/categoryModel";
import carBrandModel from "../models/carBrandModel";
import categories from "./categories";
import productBrandModel from "../models/productBrandModel";
import productBrand from "./productBrands";
import cloudinary from "../config/cloudinaryConfig";
import providerModel from "../models/providerModel";
import providers from "./providers";
import path from "path";
import productModel from "../models/productModel";
import carBrands from "./carBrands";

dotenv.config();

interface UploadedImage {
  public_id: string;
  url: string;
  format: string;
  width: number;
  height: number;
}
interface CloudinaryResource {
  public_id: string;
  url: string;
}
let apiCallsCounter = 0; // Contador de llamadas a la API de Cloudinary

const importData = async (): Promise<void> => {
  try {
    // conexion a la BD
    await connectDb();
    await Promise.all([
      categoryModel.insertMany(categories),
      carBrandModel.insertMany(carBrands),
      productBrandModel.insertMany(productBrand),
      providerModel.insertMany(providers),
    ]);
    console.log("Data imported successfully");
    process.exit(1);
  } catch (error: unknown) {
    console.log(error);
    process.exit(1);
  }
};

const deleteData = async (): Promise<void> => {
  try {
    // conexion a la BD
    await connectDb();
    await Promise.all([
      categoryModel.deleteMany(),
      carBrandModel.deleteMany(),
      productBrandModel.deleteMany(),
      providerModel.deleteMany(),
      productModel.deleteMany(),
    ]);
    console.log("Data deleted successfully");
    process.exit(1);
  } catch (error: unknown) {
    console.log(error);
    process.exit(1);
  }
};

const deleteAllCloudinary = async (): Promise<void> => {
  try {
    const [result, result2] = await Promise.all([
      cloudinary.api.delete_all_resources(),
      cloudinary.api.delete_resources_by_prefix("ov/product"),
    ]);
    console.log("Se limpio Cloudinary", result);
    console.log("Se limpio Cloudinary", result2);
    process.exit(1);
  } catch (error: unknown) {
    console.log("Se Produjo un error: ", error);
    process.exit(1);
  }
};

const uploadImagesToCloudinary = async (
  folderPath: string,
  tags: string
): Promise<void> => {
  const files = fs.readdirSync(folderPath);
  const uploadedImages: UploadedImage[] = []; // Array para almacenar la información de las imágenes subidas

  for (const file of files) {
    const filePath = `${folderPath}/${file}`;
    try {
      const extension = path.extname(file);
      const fileName = path.basename(file, extension);
      let publicId = fileName;
      if (folderPath === "uploads/CORVEN") {
        publicId = `${publicId}-COR${extension}`;
      } else {
        publicId = `SDR${publicId}${extension}`;
      }
      const result = await cloudinary.uploader.upload(filePath, {
        public_id: publicId,
        folder: "ov/products",
        tags, // Destination folder in Cloudinary
        quality: "auto", // Ajusta la calidad automáticamente
        compression: "auto", // Ajusta la compresión automáticamente
        progressive: true,
      });

      const { public_id, secure_url, format, width, height } = result;
      const uploadedImage: UploadedImage = {
        public_id,
        url: secure_url,
        format,
        width,
        height,
      };

      uploadedImages.push(uploadedImage);
      console.log(
        `File ${folderPath}/${publicId} successfully uploaded to Cloudinary`
      );
    } catch (error) {
      console.error(`Error uploading file ${file} to Cloudinary:`, error);
    }
  }
  console.log("Finalizo el proceso!!");
  const jsonUploadedImages = JSON.stringify(uploadedImages);
  fs.writeFile(
    `${tags}-uploads-cloudinary.json`,
    jsonUploadedImages,
    "utf8",
    (error) => {
      if (error) {
        console.error("Error al guardar el archivo de products JSON:", error);
      } else {
        console.log("Archivo de products JSON guardado exitosamente.");
      }
    }
  );
};

const obtenerCodigos = async (
  productBrandName: string,
  categoryName: string
): Promise<{ code: string; _id: string }[]> => {
  try {
    //await connectDb();
    // Obtener el ID de productBrand por su nombre
    const productBrandDB = await productBrandModel.findOne({
      name: productBrandName,
    });
    if (!productBrandDB) {
      console.log("No se encontró la productBrand");
      return [];
    }

    // Obtener el ID de category por su nombre
    const categoryDB = await categoryModel.findOne({
      name: categoryName,
    });
    if (!categoryDB) {
      console.log("No se encontró la category");
      return [];
    }

    // Obtener los productos filtrados por productBrand y category
    const products = await productModel.find({
      productBrand: productBrandDB._id,
      category: categoryDB._id,
    });

    console.log(products.length);
    const jsonContentProduct = JSON.stringify(products);

    fs.writeFile(
      `${productBrandDB.name}-products.json`,
      jsonContentProduct,
      "utf8",
      (error) => {
        if (error) {
          console.error(
            `Error al guardar el archivo ${productBrandDB.name}-products.json:`,
            error
          );
        } else {
          console.log(
            `Archivo ${productBrandDB.name}-products.json guardado exitosamente.`
          );
        }
      }
    );

    const codes = products.map((product) => {
      const code =
        productBrandName === "SADAR" ? product.code.slice(0, -1) : product.code;
      return { code, _id: product._id.toString() };
    });

    return codes;
  } catch (error) {
    console.error("Error al obtener los códigos:", error);
    throw error;
  }
};

const obtenerRecursosCloudinary = async (
  prefix: string,
  tags: string
): Promise<CloudinaryResource[]> => {
  // Lógica para obtener todos los recursos de Cloudinary
  const resources: CloudinaryResource[] = [];

  let nextPageToken = null;
  do {
    const { resources: currentResources, next_cursor } =
      await cloudinary.api.resources({
        type: "upload",
        resource_type: "image",
        prefix,
        tags,
        format: "jpg",
        max_results: 500,
        next_cursor: nextPageToken,
      });

    resources.push(...currentResources);
    apiCallsCounter++; // Incrementar el contador de llamadas a la API
    nextPageToken = next_cursor;
  } while (nextPageToken);

  return resources;
};

const buscarCoincidencias = async (
  productBrandName: string,
  categoryName: string,
  prefix: string,
  tags: string
): Promise<void> => {
  try {
    await connectDb();
    const codes = await obtenerCodigos(productBrandName, categoryName);
    const resources = await obtenerRecursosCloudinary(prefix, tags);
    //const resourcesContent = fs.readFileSync("resources.json", "utf8");
    //const resources: CloudinaryResource[] = JSON.parse(resourcesContent);
    console.log("Productos encontrados:", codes.length);
    console.log("Recursos en Cloudinary:", resources.length);
    const jsonContentCodes = JSON.stringify(codes);
    const jsonContentResources = JSON.stringify(resources);
    fs.writeFile(
      `${productBrandName}-codes.json`,
      jsonContentCodes,
      "utf8",
      (error) => {
        if (error) {
          console.error(
            `Error al guardar el archivo de ${productBrandName}-codes.json JSON:`,
            error
          );
        } else {
          console.log(
            `Archivo de ${productBrandName}-codes.json JSON guardado exitosamente.`
          );
        }
      }
    );
    fs.writeFile(
      `${productBrandName}-resources.json`,
      jsonContentResources,
      "utf8",
      (error) => {
        if (error) {
          console.error(
            `Error al guardar el archivo de ${productBrandName}-resources.json JSON:`,
            error
          );
        } else {
          console.log(
            `Archivo de ${productBrandName}-resources.json JSON guardado exitosamente.`
          );
        }
      }
    );
    const coincidencias: {
      code: string;
      url: string;
      public_id: string;
    }[] = [];

    for (const codeData of codes) {
      const { code, _id } = codeData;
      const regex = new RegExp(`.*${code}.*`, "i"); // Expresión regular para buscar coincidencias parciales (ignorando mayúsculas/minúsculas)
      const coincidenciasCodigo = resources.filter((resource) =>
        regex.test(resource.public_id)
      );
      coincidencias.push(
        ...coincidenciasCodigo.map((coincidencia) => ({
          code,
          url: coincidencia.url,
          public_id: coincidencia.public_id,
          _id,
        }))
      );
    }

    console.log("Coincidencias encontradas:", coincidencias.length);
    console.log("Cantidad llamadas API Cloudinary:", apiCallsCounter);

    const codigosNoEncontrados = codes.filter(
      (codeData) =>
        !coincidencias.some(
          (coincidencia) => coincidencia.code === codeData.code
        )
    );
    const jsonContentCoincidencias = JSON.stringify(coincidencias);
    const jsonContentCodigosNoEncontrados =
      JSON.stringify(codigosNoEncontrados);

    fs.writeFile(
      `${productBrandName}-coincidencias.json`,
      jsonContentCoincidencias,
      "utf8",
      (error) => {
        if (error) {
          console.error(
            `Error al guardar el archivo de ${productBrandName}-coincidencias.json JSON:`,
            error
          );
        } else {
          console.log(
            `Archivo de ${productBrandName}-coincidencias.json guardado exitosamente.`
          );
        }
      }
    );

    fs.writeFile(
      `${productBrandName}-codigos_no_encontrados.json`,
      jsonContentCodigosNoEncontrados,
      "utf8",
      (error) => {
        if (error) {
          console.error(
            `Error al guardar el archivo ${productBrandName}-codigos_no_encontrados.json JSON:`,
            error
          );
        } else {
          console.log(
            `Archivo ${productBrandName}-codigos_no_encontrados.json JSON guardado exitosamente.`
          );
        }
      }
    );
    console.log(
      "Cantidad de códigos no encontrados:",
      codigosNoEncontrados.length
    );

    for (const coincidencia of coincidencias) {
      const { code, url } = coincidencia;
      // Actualizar el producto con el código correspondiente
      await productModel.updateMany(
        { code: { $regex: new RegExp(`^${code}`, "i") } },
        { image: url }
      );
    }

    console.log("Actualización de productos completada.", productBrandName);
  } catch (error) {
    console.error("Error:", error);
  }
};

if (process.argv[2] === "-i") {
  void importData();
}

if (process.argv[2] === "-e") {
  void deleteData();
}

if (process.argv[2] === "-c") {
  void deleteAllCloudinary();
}

if (process.argv[2] === "-u") {
  void uploadImagesToCloudinary("uploads/CORVEN", "CORVEN");
  void uploadImagesToCloudinary("uploads/SADAR", "SADAR");
}

if (process.argv[2] === "-img") {
  buscarCoincidencias("SADAR", "AMORTIGUADOR", "ov/products/SDR", "SADAR");
  buscarCoincidencias("CORVEN", "AMORTIGUADOR", "ov/products", "CORVEN");
  //obtenerCodigos("SADAR", "AMORTIGUADOR");
  //obtenerCodigos("CORVEN", "AMORTIGUADOR");
}
