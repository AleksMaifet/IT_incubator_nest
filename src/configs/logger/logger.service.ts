import { createLogger, format, Logger, transports } from 'winston'

class LoggerService {
  public readonly logger: Logger

  constructor() {
    const { combine, timestamp, colorize, printf } = format

    this.logger = createLogger({
      format: combine(
        colorize({
          level: true,
          message: false,
          colors: { info: 'blue', error: 'red', warn: 'yellow' },
        }),
        timestamp({
          format: 'DD/MM - HH:mm:ss',
        }),
        printf(({ level, message, timestamp }) => {
          return `${timestamp} ${level}: ${message}`
        }),
      ),
      transports: [new transports.Console()],
    })
  }
}

export { LoggerService }
