import jwt from "jsonwebtoken";

const generateJWT = (id: string) => {
  // Verifica si la variable de entorno tiene un valor definido
  const secretKey = process.env.SECRETORPRIVATEKEY || "D3fau1t"; // Replace "" with your default secret key
  return jwt.sign({ id }, secretKey, { expiresIn: "1d" });
};

export { generateJWT };
