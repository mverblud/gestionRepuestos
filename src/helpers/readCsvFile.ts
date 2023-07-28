import csv from "csv-parser";
import fs from "fs";
import { ICSVData } from "../interfaces/CSVData.interface";

const readCSVFile = (filePath: string): Promise<ICSVData[]> => {
  return new Promise((resolve, reject) => {
    const results: ICSVData[] = [];

    fs.createReadStream(filePath)
      .pipe(
        csv({
          separator: ";",
          newline: "\n",
          headers: [
            "code",
            "productBrand",
            "carBrand",
            "category",
            "name",
            "provider",
          ],
        })
      )
      .on("data", (data: ICSVData) => {
        results.push(data);
      })
      .on("end", () => {
        resolve(results);
      })
      .on("error", (error: Error) => {
        reject(error);
      });
  });
};

export interface ICSVDataUpd {
  code: string;
  price: number;
  iva?: number;
  detail?: string;
}

const readCSVFileUpdate = (
  filePath: string,
  headers: string[]
): Promise<ICSVDataUpd[]> => {
  return new Promise((resolve, reject) => {
    const results: ICSVDataUpd[] = [];

    fs.createReadStream(filePath)
      .pipe(
        csv({
          separator: ",",
          newline: "\n",
          headers: headers,
        })
      )
      .on("data", (data: ICSVDataUpd) => {
        results.push(data);
      })
      .on("end", () => {
        resolve(results);
      })
      .on("error", (error: Error) => {
        reject(error);
      });
  });
};

export { readCSVFile, readCSVFileUpdate };
