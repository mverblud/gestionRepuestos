import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import carBrandModel from "../models/carBrandModel";
import productBrandModel from "../models/productBrandModel";
import categoryModel from "../models/categoryModel";
import providerModel from "../models/providerModel";
import productModel from "../models/productModel";

const allowedCollections = [
  "carBrands",
  "productBrands",
  "categories",
  "products",
  "providers",
] as const;

type AllowedCollection = (typeof allowedCollections)[number];

interface IQueryParams {
  limit?: number;
  skip?: number;
  category?: string;
  carBrand?: string;
  productBrand?: string;
  provider?: string;
}

const searchCarBrands = async (term: string, res: Response) => {
  if (isValidObjectId(term)) {
    const carBrand = await carBrandModel.findById(term);
    return res.json({
      results: carBrand ? [carBrand] : [],
    });
  }

  const regex = new RegExp(term, "i");
  const carBrands = await carBrandModel.find({
    $or: [{ name: regex }],
    $and: [{ status: true }],
  });

  return res.json({
    results: carBrands,
  });
};

const searchProductBrands = async (term: string, res: Response) => {
  if (isValidObjectId(term)) {
    const productBrand = await productBrandModel.findById(term);
    return res.json({
      results: productBrand ? [productBrand] : [],
    });
  }

  const regex = new RegExp(term, "i");
  const productBrands = await productBrandModel.find({
    $or: [{ name: regex }],
    $and: [{ status: true }],
  });

  return res.json({
    results: productBrands,
  });
};

const searchCategories = async (term: string, res: Response) => {
  if (isValidObjectId(term)) {
    const category = await categoryModel.findById(term);
    return res.json({
      results: category ? [category] : [],
    });
  }

  const regex = new RegExp(term, "i");
  const categories = await categoryModel.find({
    $or: [{ name: regex }],
    $and: [{ status: true }],
  });

  return res.json({
    results: categories,
  });
};

const searchProviders = async (term: string, res: Response) => {
  if (isValidObjectId(term)) {
    const provider = await providerModel.findById(term);
    return res.json({
      results: provider ? [provider] : [],
    });
  }

  const regex = new RegExp(term, "i");
  const providers = await providerModel.find({
    $or: [{ name: regex }],
    $and: [{ status: true }],
  });

  return res.json({
    results: providers,
  });
};

const searchProducts = async (
  term: string | undefined,
  req: Request,
  res: Response
) => {
  const queryParams = req.query as IQueryParams;

  // Pagination and filtering
  const filter: any = { status: true };

  const {
    limit = 50,
    skip = 0,
    category,
    productBrand,
    carBrand,
    provider,
  } = queryParams;

  if (term !== undefined) {
    // Regular expression
    const regex = new RegExp(term, "i");
    filter.$or = [{ name: regex }, { code: regex }];
  }

  if (category) {
    filter.category = category;
  }

  if (productBrand) {
    filter.productBrand = productBrand;
  }

  if (carBrand) {
    filter.carBrand = carBrand;
  }

  if (provider) {
    filter.provider = provider;
  }

  const [total, products] = await Promise.all([
    productModel.countDocuments(filter),
    productModel
      .find(filter)
      .populate("category", "name")
      .populate("carBrand", "name")
      .populate("productBrand", "name")
      .populate("provider", "name nameShort")
      .skip(Number(skip))
      .limit(Number(limit))
      .sort({ image: 1 }),
  ]);

  res.json({
    results: {
      total,
      products,
    },
  });
};

const search = (req: Request, res: Response) => {
  const { collection } = req.params;
  const { term } = req.query as { term: string };

  if (!allowedCollections.includes(collection as AllowedCollection)) {
    return res.status(400).json({
      message: `Allowed collections are: ${allowedCollections.join(", ")}`,
    });
  }

  switch (collection) {
    case "carBrands":
      return searchCarBrands(term, res);
    case "productBrands":
      return searchProductBrands(term, res);
    case "categories":
      return searchCategories(term, res);
    case "providers":
      return searchProviders(term, res);
    case "products":
      return searchProducts(term, req, res);
    default:
      return res.status(500).json({
        msg: "Search not implemented",
      });
  }
};

export { search };
