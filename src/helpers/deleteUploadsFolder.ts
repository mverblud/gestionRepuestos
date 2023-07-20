import fs from "fs";

const uploadsDirectory = "uploads/";

export const deleteUploadsFolder = () => {
  const directory = `${uploadsDirectory}`;

  if (fs.existsSync(directory)) {
    const files = fs.readdirSync(directory);
    files.forEach((file) => {
      if (file !== "CORVEN" && file !== "SADAR") {
        const filePath = `${directory}${file}`;
        fs.unlinkSync(filePath);
      }
    });
  }
};

export default deleteUploadsFolder;
