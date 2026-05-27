import { createLogger, transports, format } from 'winston';

const logger = createLogger({
  format: format.combine(
    format.colorize(), 
    format.simple(),
    format.printf(({ level, message }) => `\n${level}: ${message}`) 
  ),
  transports: [
    new transports.Console()
  ]
});
export default logger;