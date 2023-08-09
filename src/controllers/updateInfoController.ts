import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";

import { LogLevel, logger } from "../helpers/logger";
import updateInfoModel from "../models/updateInfoModel";
import updateInfoDetailModel from "../models/updateInfoDetailModel";

const getAllUpdateInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 100, offset = 0 } = req.query;

    const [total, updateInfos] = await Promise.all([
      updateInfoModel.countDocuments(),
      updateInfoModel
        .find()
        .populate("provider", "name nameShort")
        .populate("user", "name email")
        .skip(Number(offset))
        .limit(Number(limit))
        .sort({ name: 1 }),
    ]);

    res.json({
      total,
      limit: Number(limit),
      offset: Number(offset),
      updateInfos,
    });
  } catch (error) {
    logger("getUpdateInfo", error, LogLevel.ERROR);
    res.status(500).json({ error: "Could not get UpdateInfo." });
  }
};

const getUpdateInfo = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid ID format." });
    }

    const updateInfo = await updateInfoModel
      .findById(id)
      .populate("provider", "name nameShort")
      .populate("user", "name email");

    if (!updateInfo) {
      return res.status(404).json({ error: "UpdateInfo not found." });
    }

    return res.json(updateInfo);
  } catch (error) {
    logger("getUpdateInfo", error, LogLevel.ERROR);
    return res.status(500).json({ error: "Could not get UpdateInfo." });
  }
};

const getUpdateInfoDetail = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { limit = 100, offset = 0 } = req.query;
  try {
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid ID format." });
    }

    const [total, updateInfoDetails] = await Promise.all([
      updateInfoDetailModel.countDocuments(),
      updateInfoDetailModel
        .find({ updateInfo: id })
        .populate("product", "name price code")
        .populate("updateInfo", "fileName")
        .skip(Number(offset))
        .limit(Number(limit))
        .sort({ name: 1 }),
    ]);

    if (!updateInfoDetails) {
      return res.status(404).json({ error: "Update Info Detail not found." });
    }

    return res.json({
      total,
      limit: Number(limit),
      offset: Number(offset),
      updateInfoDetails,
    });
  } catch (error) {
    logger("getUpdateInfoDetail", error, LogLevel.ERROR);
    return res.status(500).json({ error: "Could not get UpdateInfoDetail." });
  }
};

export { getAllUpdateInfo, getUpdateInfo, getUpdateInfoDetail };
