import pino from 'pino';

// Forzamos el destino de escritura de forma explícita para producción
const destination = process.env.NODE_ENV === 'production'
  ? pino.destination({ sync: true }) // Escribe directamente a la consola sin hilos/workers
  : undefined;

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    ...(process.env.NODE_ENV === 'production' 
      ? {} 
      : {
          transport: {
            target: 'pino-pretty',
            options: { colorize: true }
          }
        })
  },
  destination!
);
