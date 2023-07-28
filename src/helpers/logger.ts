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
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  };
  const timestamp = date.toLocaleString("es-AR", options);
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
