import { createLogger, format, transports } from 'winston';
import { ENV_VARIABLES } from './env-variables';

export const logger = createLogger({
  level: ENV_VARIABLES.PRODUCTION ? 'info' : 'silly',
  transports: [
    new transports.Console({
      format: format.combine(
        format.timestamp(),
        format.prettyPrint(),
        format.colorize({ level: true }),
        format.printf((info) => `[${info.level}] ${info.message}`),
      ),
    }),
  ],
});
