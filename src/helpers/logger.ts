export enum LogLevel {
  LOG = "log",
  INFO = "info",
  ERROR = "error",
}

export const logger = (
  functionName: string,
  message: unknown,
  level: LogLevel = LogLevel.LOG
): void => {
  const logLevel = level.toUpperCase();
  const timestamp = new Date().toISOString();
  let logMessage: string;

  if (typeof message === "string" || message instanceof Error) {
    logMessage = message.toString();
  } else {
    logMessage = JSON.stringify(message);
  }

  switch (level) {
    case LogLevel.LOG:
      console.log(
        `[${timestamp}] [${logLevel}] [${functionName}] ${logMessage}`
      );
      break;
    case LogLevel.INFO:
      console.info(
        `[${timestamp}] [${logLevel}] [${functionName}] ${logMessage}`
      );
      break;
    case LogLevel.ERROR:
      console.error(
        `[${timestamp}] [${logLevel}] [${functionName}] ${logMessage}`
      );
      break;
    default:
      console.log(
        `[${timestamp}] [${logLevel}] [${functionName}] ${logMessage}`
      );
  }
};

// // Ejemplo de uso:
// function myController() {
//   try {
//     // Simulamos un error lanzando una excepción
//     throw new Error("Este es un error de ejemplo en el controller.");
//   } catch (error) {
//     logger(error, LogLevel.ERROR);
//   }

//   // Registro de un mensaje informativo
//   logger("Este es un mensaje informativo.", LogLevel.INFO);
// }

// myController();
